import flwr as fl
import torch
import os
import time
import timeit
from logging import INFO
from flwr.common.logger import log
from flwr.server.history import History
from flwr.server.client_manager import SimpleClientManager
from dotenv import load_dotenv
from model import WastePredictor
from collections import OrderedDict

# Get the directory where this script is located
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "models", "waste_predictor.pt")

load_dotenv()

class SaveModelStrategy(fl.server.strategy.FedAvg):
    def __init__(self, model, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.model = model

    def aggregate_fit(self, server_round, results, failures):
        # Handle client disconnections gracefully
        if failures:
            for client_proxy, failure in failures:
                # Check if it's a client disconnect (buffer empty - expected behavior)
                if "Buffer empty" in str(failure) or "ClientDisconnect" in str(failure):
                    log(INFO, f"Server: Client disconnected (no data available) - this is expected behavior")
                else:
                    log(INFO, f"Server: Client failure: {failure}")
        
        # Check for zero examples to avoid ZeroDivisionError in super().aggregate_fit
        if not results or sum(fit_res.num_examples for _, fit_res in results) == 0:
            print(f"Server: No data received for round {server_round}. Skipping aggregation.")
            return None, {}

        # Get old parameters before aggregation
        old_params = [val.cpu().numpy() for _, val in self.model.state_dict().items()]

        aggregated_parameters, aggregated_metrics = super().aggregate_fit(server_round, results, failures)
        
        if aggregated_parameters is not None:
            print(f"Server: Saving updated model for round {server_round}...")
            # Convert parameters to ndarrays
            new_params = fl.common.parameters_to_ndarrays(aggregated_parameters)
            
            # Calculate update magnitude
            total_diff = 0.0
            for old, new in zip(old_params, new_params):
                diff = new - old
                total_diff += (diff ** 2).sum()
            update_norm = total_diff ** 0.5
            print(f"Server: Model Update Magnitude (L2 Norm): {update_norm:.6f}")

            # Convert to state_dict
            params_dict = zip(self.model.state_dict().keys(), new_params)
            state_dict = OrderedDict({k: torch.tensor(v) for k, v in params_dict})
            # Load into model
            self.model.load_state_dict(state_dict, strict=True)
            # Save to disk
            torch.save(self.model.state_dict(), MODEL_PATH)
            
        return aggregated_parameters, aggregated_metrics

class PersistentServer(fl.server.Server):
    def fit(self, num_rounds, timeout):
        """Run federated averaging for a number of rounds, retrying failed rounds."""
        history = History()

        # Initialize parameters
        log(INFO, "[INIT]")
        self.parameters = self._get_initial_parameters(server_round=0, timeout=timeout)
        log(INFO, "Starting evaluation of initial global parameters")
        res = self.strategy.evaluate(0, parameters=self.parameters)
        if res is not None:
            log(
                INFO,
                "initial parameters (loss, other metrics): %s, %s",
                res[0],
                res[1],
            )
            history.add_loss_centralized(server_round=0, loss=res[0])
            history.add_metrics_centralized(server_round=0, metrics=res[1])
        else:
            log(INFO, "Evaluation returned no results (`None`)")

        # Run federated learning for num_rounds
        start_time = timeit.default_timer()
        current_round = 1
        
        while current_round <= num_rounds:
            log(INFO, "")
            log(INFO, "[ROUND %s]", current_round)
            # Train model and replace previous global model
            res_fit = self.fit_round(
                server_round=current_round,
                timeout=timeout,
            )
            
            round_successful = False
            if res_fit is not None:
                parameters_prime, fit_metrics, _ = res_fit  # fit_metrics_aggregated
                if parameters_prime:
                    self.parameters = parameters_prime
                    round_successful = True
                history.add_metrics_distributed_fit(
                    server_round=current_round, metrics=fit_metrics
                )

            if round_successful:
                # Evaluate model using strategy implementation
                res_cen = self.strategy.evaluate(current_round, parameters=self.parameters)
                if res_cen is not None:
                    loss_cen, metrics_cen = res_cen
                    log(
                        INFO,
                        "fit progress: (%s, %s, %s, %s)",
                        current_round,
                        loss_cen,
                        metrics_cen,
                        timeit.default_timer() - start_time,
                    )
                    history.add_loss_centralized(server_round=current_round, loss=loss_cen)
                    history.add_metrics_centralized(
                        server_round=current_round, metrics=metrics_cen
                    )

                # Evaluate model on a sample of available clients
                res_fed = self.evaluate_round(server_round=current_round, timeout=timeout)
                if res_fed is not None:
                    loss_fed, evaluate_metrics_fed, _ = res_fed
                    if loss_fed is not None:
                        history.add_loss_distributed(
                            server_round=current_round, loss=loss_fed
                        )
                        history.add_metrics_distributed(
                            server_round=current_round, metrics=evaluate_metrics_fed
                        )
                
                # Only increment round if successful
                current_round += 1
            else:
                log(INFO, "Round %s failed or no data received. Waiting for client to reconnect...", current_round)
                # Sleep before retrying to avoid busy-waiting
                time.sleep(5)
                
        return history, timeit.default_timer() - start_time

def get_parameters(model):
    return [val.cpu().numpy() for _, val in model.state_dict().items()]

def main():
    # Load the pretrained model
    model = WastePredictor()
    try:
        model.load_state_dict(torch.load(MODEL_PATH))
        print(f"Loaded pretrained model from {MODEL_PATH}")
    except Exception as e:
        print(f"Error loading model: {e}")
        return

    # Define strategy
    strategy = SaveModelStrategy(
        model=model,
        fraction_fit=1.0,          # Train on 100% of available clients
        fraction_evaluate=1.0,     # Evaluate on 100% of available clients
        min_fit_clients=1,         # Require at least 1 client to train
        min_evaluate_clients=1,    # Require at least 1 client to evaluate
        min_available_clients=1,
        initial_parameters=fl.common.ndarrays_to_parameters(get_parameters(model)),
    )

    # Create custom server
    client_manager = SimpleClientManager()
    server = PersistentServer(client_manager=client_manager, strategy=strategy)

    # Start Flower server
    fl.server.start_server(
        server_address=os.getenv("SERVER_ADDRESS", "0.0.0.0:8081"),
        config=fl.server.ServerConfig(num_rounds=int(os.getenv("NUM_ROUNDS", 3))),
        server=server,
    )

if __name__ == "__main__":
    main()
