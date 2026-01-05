import streamlit as st
import pandas as pd
import os

PATH = os.path.join(os.path.dirname(__file__), "models", "fl_metrics.csv")

st.set_page_config(page_title="Federated Learning Dashboard", layout="wide")
st.title("Federated Learning Metrics Dashboard")

if not os.path.exists(PATH):
    st.error(f"No metrics file found at {PATH}. Run the Flower server first to produce metrics.")
else:
    df = pd.read_csv(PATH)
    if df.empty:
        st.warning("Metrics file is present but empty.")
    else:
        # Ensure round is integer
        if "round" in df.columns:
            try:
                df["round"] = df["round"].astype(int)
            except Exception:
                pass

        st.subheader("Per-round metrics (table)")
        st.dataframe(df.sort_values("round").reset_index(drop=True))

        st.subheader("Update Norm and Total Examples")
        cols = st.columns(2)
        with cols[0]:
            if "update_norm" in df.columns:
                chart_df = df.set_index("round")["update_norm"].fillna(0)
                st.line_chart(chart_df)
            else:
                st.info("No `update_norm` column available yet.")
        with cols[1]:
            if "total_examples" in df.columns:
                chart_df2 = df.set_index("round")["total_examples"].fillna(0)
                st.bar_chart(chart_df2)
            else:
                st.info("No `total_examples` column available yet.")

        st.subheader("Evaluation Metrics (raw)")
        eval_cols = [c for c in df.columns if "centralized" in c or "distributed" in c]
        if eval_cols:
            st.write(df[["round"] + eval_cols].sort_values("round").reset_index(drop=True))
        else:
            st.info("No centralized/distributed evaluation metrics recorded yet.")

        st.subheader("Download CSV")
        with open(PATH, "rb") as f:
            st.download_button("Download fl_metrics.csv", f, file_name="fl_metrics.csv")
