import Image from "next/image";
import HomeCard from "@/components/common/HomeCard";


const homeCardData = [
    {
        title: "Know the Exact Harvest Day",
        description: "Every saltern owner lies awake wondering “Will it crystallize this week?”. ",
        image: "/assets/images/crystal-logo.svg",
        link: "/crystal",
    },
    {
        title: "Plan the Perfect Season",
        description: "Gives the feeling of upgrading from a bicycle to an air-conditioned control room.",
        image: "/assets/images/compass-logo.svg",
        link: "/compass",
    },
    {
        title: "The End of Manual Checking",
        description: "Uses strong, absolute language that buyers and regulators love to hear.",
        image: "/assets/images/vision-logo.svg",
        link: "/vision",
    },
    {
        title: "From Bittern to Bank",
        description: "Elegant play on circular economy + financial upside.",
        image: "/assets/images/valor-logo.svg",
        link: "/valor",
    },
];

export default function HomeSection() {
    return (
        <div className="min-h-screen bg-white p-4 md:p-6 flex items-center justify-center">
            <div className="w-full rounded-2xl p-4 md:p-6 border border-gray-200 bg-gray-50/20">
                <div className="flex flex-col lg:flex-row lg:justify-between gap-6 lg:gap-0 min-h-[83vh] lg:h-[83vh]">
                    {/* Left Section - Content Area */}
                    <div className="w-full lg:w-[40%] flex flex-col justify-center lg:justify-between gap-4 md:gap-6">
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-center lg:justify-start">
                                <Image src="/assets/images/logo.svg" alt="Logo" width={160} height={45} className="w-32 md:w-40 lg:w-[200px]" />
                            </div>
                        </div>
                        {/* Title Section */}
                        <div className="flex flex-col gap-3 md:gap-4 text-center lg:text-left">
                            <div className="flex flex-col">
                                <h1 className="text-5xl lg:text-6xl font-bold tracking-tighter bg-linear-[90deg,#FFB622_0%,#FF7373_20%,#00D4FF_30%,#01B87A_80%] bg-clip-text text-transparent pb-1 md:pb-2">
                                    Intelligent Salt
                                </h1>
                                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tighter text-black">
                                    Production for New Era
                                </h1>
                            </div>
                            <p className="text-sm md:text-base font-regular text-gray-500 tracking-tight leading-5 md:leading-6">
                                AI-powered quality inspection, crystallization forecasting, seasonal planning, and waste valorization — built exclusively for Sri Lanka's salt producers to increase yield, guarantee export quality, and eliminate waste.
                            </p>
                        </div>
                    </div>

                    {/* Right Section - Card Grid */}
                    <div className="w-full lg:w-[55%] flex gap-4 md:gap-6">
                        {/* Image Grid - responsive columns */}
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-5 h-full">
                            {homeCardData.map((card, index) => (
                                <HomeCard key={index} {...card} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}