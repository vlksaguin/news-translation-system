import { useNavigate } from "react-router-dom";
import HeroCountCard from "./HeroCountCard";
// import 

function DashSummary({counts}) {
    const navigate = useNavigate();

    const itemCounts = [
      {label: "Total", value: counts.all},
      {label: "Drafts", value: counts.draft},
      {label: "For Review", value: counts.for_review},
      {label: "Published", value: counts.published}
    ];

    return (
        <section className="news-hero mb-6 p-6 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Editor Desk</p>
              <h1 className="brand-heading text-3xl font-bold text-slate-900 md:text-4xl">News Translation Workflow</h1>
              <p className="mt-2 max-w-2xl text-slate-700">
                Manage draft writing, six-language review, and publication with an editorial-first workflow.
              </p>
            </div>

            <button
              onClick={() => navigate("/new")}
              className="btn-primary"
            >
              + New Article
            </button>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
            {itemCounts.map((item) => (
              <HeroCountCard
                label={item.label}
                count={item.value}
              />
            ))}
          </div>
        </section>
    );
}

export default DashSummary;