function HeroCountCard({label, count}){
    // const count = counts;

    return (
        <div className="surface-muted p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
              <p className="text-2xl font-bold text-slate-900">{count}</p>
        </div>
    );
};

export default HeroCountCard;