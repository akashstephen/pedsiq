'use client';

interface DdxBranch {
  condition: string;
  findings: string[];
  next?: DdxBranch[];
}

interface DifferentialDiagnosisProps {
  title: string;
  branches: DdxBranch[];
}

export function DifferentialDiagnosis({ title, branches }: DifferentialDiagnosisProps) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 md:p-6 my-4">
      <div className="text-white/50 text-xs font-bold uppercase tracking-wider mb-4 text-center">
        {title}
      </div>
      <div className="space-y-3">
        {branches.map((branch, i) => (
          <DdxNode key={i} branch={branch} level={0} />
        ))}
      </div>
    </div>
  );
}

function DdxNode({ branch, level }: { branch: DdxBranch; level: number }) {
  const indent = level * 24;
  
  return (
    <div style={{ marginLeft: `${indent}px` }}>
      <div className="flex items-start gap-3">
        <div className="w-2 h-2 rounded-full bg-[#007AFF] mt-1.5 shrink-0" />
        <div className="flex-1">
          <div className="text-white/90 text-sm font-medium">{branch.condition}</div>
          {branch.findings.length > 0 && (
            <ul className="mt-1.5 space-y-1">
              {branch.findings.map((finding, fi) => (
                <li key={fi} className="text-white/60 text-xs flex items-start gap-1.5">
                  <span className="text-white/30">→</span>
                  {finding}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      {branch.next && branch.next.length > 0 && (
        <div className="mt-2 pl-4 border-l border-white/[0.08]">
          {branch.next.map((nextBranch, ni) => (
            <DdxNode key={ni} branch={nextBranch} level={0} />
          ))}
        </div>
      )}
    </div>
  );
}
