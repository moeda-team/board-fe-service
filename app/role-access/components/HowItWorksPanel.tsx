import { Card } from "@/components/ui/card";

export function HowItWorksPanel() {
  return (
    <Card className="shadow-sm border-slate-200 mt-2">
      <div className="p-5">
        <h2 className="font-semibold text-slate-900">How it works</h2>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          Setup roles and access in 3 steps
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Step 1 */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 flex gap-3 items-start">
            <div className="rounded-full bg-brand-soft-purple flex items-center justify-center h-6 w-6 shrink-0 mt-0.5">
              <span className="text-brand-purple font-bold text-xs">
                1
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-slate-900 text-sm">
                Create or Select Role
              </span>
              <span className="text-xs text-slate-500 mt-1 leading-relaxed">
                Create new role or use existing system role
              </span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 flex gap-3 items-start">
            <div className="rounded-full bg-brand-soft-purple flex items-center justify-center h-6 w-6 shrink-0 mt-0.5">
              <span className="text-brand-purple font-bold text-xs">
                2
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-slate-900 text-sm">
                Configure Permission
              </span>
              <span className="text-xs text-slate-500 mt-1 leading-relaxed">
                Set permission for each module and features
              </span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 flex gap-3 items-start">
            <div className="rounded-full bg-brand-soft-purple flex items-center justify-center h-6 w-6 shrink-0 mt-0.5">
              <span className="text-brand-purple font-bold text-xs">
                3
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-slate-900 text-sm">
                Assign to Member
              </span>
              <span className="text-xs text-slate-500 mt-1 leading-relaxed">
                Assign the role to members or teams
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
