const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

const layoutStartStr = `        {/* Cinematic glow in backgrounds */}
        <div className={\`absolute top-1/4 left-1/4 w-[35rem] h-[35rem] rounded-full blur-[120px] pointer-events-none \${isDarkMode ? "bg-[#7D8C61]/10" : "bg-[#70ABAF]/15"}\`}></div>
        <div className={\`absolute bottom-1/4 right-1/4 w-[35rem] h-[35rem] rounded-full blur-[140px] pointer-events-none \${isDarkMode ? "bg-[#81A1C1]/5" : "bg-[#99E1D9]/20"}\`}></div>

        <div className="w-full flex h-screen z-10 relative">
          <div className="w-full lg:w-[500px] xl:w-[550px] shrink-0 h-full overflow-y-auto flex flex-col justify-center items-center p-6 sm:p-10 relative z-20">
            <motion.div
              initial={{`;

const replacementLayoutStartStr = `        {/* Cinematic glow in backgrounds */}
        <div className={\`absolute top-1/4 left-1/4 w-[35rem] h-[35rem] rounded-full blur-[120px] pointer-events-none \${isDarkMode ? "bg-[#7D8C61]/10" : "bg-[#70ABAF]/15"}\`}></div>
        <div className={\`absolute bottom-1/4 right-1/4 w-[35rem] h-[35rem] rounded-full blur-[140px] pointer-events-none \${isDarkMode ? "bg-[#81A1C1]/5" : "bg-[#99E1D9]/20"}\`}></div>

        <motion.div
          initial={{`;

code = code.replace(layoutStartStr, replacementLayoutStartStr);

const layoutEndStr = `          {/* Demo Sandbox Mode */}
          <div className={\`text-center pt-3 border-t \${isDarkMode ? "border-[#1B1E26]" : "border-[#E6E2D8]/50"}\`}>
            <span className={\`text-[10px] font-mono block mb-2 uppercase tracking-wide \${isDarkMode ? "text-[#8C929D]" : "text-[#9A9489]"}\`}>Or explore immediately:</span>
            <button
              onClick={handleDemoMode}
              className={\`text-xs font-mono font-bold underline transition \${isDarkMode ? "text-[#7D8C61] hover:text-[#8A9A5B]" : "text-[#70ABAF] hover:text-[#5C9498]"}\`}
            >
              Launch Sandbox Mode (Offline Demo)
            </button>
          </div>
        </motion.div>
        </div>

        <div className="hidden lg:flex flex-1 items-center justify-center relative p-12 z-10">
          <InteractiveDoctors isPasswordFocused={isPasswordFocused} isDarkMode={isDarkMode} />
        </div>
      </div>`;

const replacementLayoutEndStr = `          {/* Demo Sandbox Mode */}
          <div className={\`text-center pt-3 border-t \${isDarkMode ? "border-[#1B1E26]" : "border-[#E6E2D8]/50"}\`}>
            <span className={\`text-[10px] font-mono block mb-2 uppercase tracking-wide \${isDarkMode ? "text-[#8C929D]" : "text-[#9A9489]"}\`}>Or explore immediately:</span>
            <button
              onClick={handleDemoMode}
              className={\`text-xs font-mono font-bold underline transition \${isDarkMode ? "text-[#7D8C61] hover:text-[#8A9A5B]" : "text-[#70ABAF] hover:text-[#5C9498]"}\`}
            >
              Launch Sandbox Mode (Offline Demo)
            </button>
          </div>
        </motion.div>`;

code = code.replace(layoutEndStr, replacementLayoutEndStr);

const pwdSearch = `                  <input
                  type="password"
                  required
                  minLength={6}
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                  placeholder="••••••••"`;

const pwdReplace = `                  <input
                  type="password"
                  required
                  minLength={6}
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••"`;

code = code.replace(pwdSearch, pwdReplace);

code = code.replace(
  '<div className={`min-h-screen flex relative overflow-hidden ${isDarkMode ? "bg-[#040507]" : "bg-[#F0F7F4]"}`} id="onboarding-portal">',
  '<div className={`min-h-screen flex items-center justify-center relative overflow-hidden ${isDarkMode ? "bg-[#040507]" : "bg-[#F0F7F4]"}`} id="onboarding-portal">'
);

code = code.replace('import { InteractiveDoctors } from "./components/InteractiveDoctors";\n', '');
code = code.replace('const [isPasswordFocused, setIsPasswordFocused] = useState(false);\n', '');

fs.writeFileSync('src/App.tsx', code);
