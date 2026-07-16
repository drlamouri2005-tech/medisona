const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

// Find MainAppLayout definition to inject mouse tracking state
const mainAppLayoutStart = 'function MainAppLayout() {';
const mainAppLayoutReplacement = `import gsap from "gsap";\nimport doctorsImage from "./assets/images/doctors_3d_group_1783986849555.jpg";\nimport doctorsEyesClosed from "./assets/images/doctors_3d_group_eyes_closed_1783987814813.jpg";\n\nfunction MainAppLayout() {\n  const [isPasswordFocused, setIsPasswordFocused] = useState(false);\n  const imageWrapperRef = React.useRef<HTMLDivElement>(null);\n\n  useEffect(() => {\n    const handleMouseMove = (e: MouseEvent) => {\n      if (!imageWrapperRef.current) return;\n      const { clientX, clientY } = e;\n      const { innerWidth, innerHeight } = window;\n      const tiltX = (clientY / innerHeight - 0.5) * -15;\n      const tiltY = (clientX / innerWidth - 0.5) * 15;\n\n      gsap.to(imageWrapperRef.current, {\n        rotateX: tiltX,\n        rotateY: tiltY,\n        duration: 0.5,\n        ease: "power2.out"\n      });\n    };\n    window.addEventListener("mousemove", handleMouseMove);\n    return () => window.removeEventListener("mousemove", handleMouseMove);\n  }, []);\n`;
code = code.replace(mainAppLayoutStart, mainAppLayoutReplacement);

// Find the auth block
const startStr = '    return (\n      <div className={`min-h-screen flex items-center justify-center p-4 sm:p-10 relative overflow-y-auto py-12 ${isDarkMode ? "bg-[#040507]" : "bg-[#F0F7F4]"}`} id="onboarding-portal">';
const endStr = '      </div>\n    );\n  }\n\n  // 2. Choosing Year';

let startIndex = code.indexOf(startStr);
let endIndex = code.indexOf(endStr);

if (startIndex === -1 || endIndex === -1) {
  console.error("Could not find start or end bounds.");
  process.exit(1);
}

const replacement = `    return (
      <div className={\`min-h-screen flex relative overflow-hidden \${isDarkMode ? "bg-[#040507]" : "bg-[#F0F7F4]"}\`} id="onboarding-portal">
        <MolecularBackdrop />

        {/* Theme Toggle */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={\`absolute top-6 right-6 z-50 p-2.5 rounded-full backdrop-blur-md border transition-all duration-300 \${
            isDarkMode 
              ? "bg-[#0a0a0e]/95 border-[#7D8C61]/30 text-[#7D8C61] hover:bg-[#7D8C61]/10 hover:border-[#7D8C61]/60" 
              : "bg-[#F0F7F4] border-[#70ABAF]/30 text-[#70ABAF] hover:bg-[#70ABAF]/10 hover:border-[#70ABAF]/60"
          }\`}
          aria-label="Toggle theme"
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Cinematic glow in backgrounds */}
        <div className={\`absolute top-1/4 left-1/4 w-[35rem] h-[35rem] rounded-full blur-[120px] pointer-events-none \${isDarkMode ? "bg-[#7D8C61]/10" : "bg-[#70ABAF]/15"}\`}></div>
        <div className={\`absolute bottom-1/4 right-1/4 w-[35rem] h-[35rem] rounded-full blur-[140px] pointer-events-none \${isDarkMode ? "bg-[#81A1C1]/5" : "bg-[#99E1D9]/20"}\`}></div>

        <div className="w-full flex h-screen">
          <div className="hidden lg:flex flex-1 items-center justify-center relative p-12 z-20" style={{ perspective: "1000px" }}>
            <div ref={imageWrapperRef} className="relative w-full max-w-2xl aspect-square rounded-[2rem] overflow-hidden shadow-2xl transition-all duration-500 transform-gpu bg-white/5 border border-white/5 p-3">
              <div className="relative w-full h-full rounded-[1.5rem] overflow-hidden">
                <img 
                  src={doctorsImage} 
                  alt="Doctors" 
                  className={\`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 \${isPasswordFocused ? 'opacity-0' : 'opacity-100'}\`} 
                />
                <img 
                  src={doctorsEyesClosed} 
                  alt="Doctors Eyes Closed" 
                  className={\`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 \${isPasswordFocused ? 'opacity-100' : 'opacity-0'}\`} 
                />
              </div>
            </div>
          </div>
          
          <div className={\`w-full lg:w-[480px] shrink-0 h-full overflow-y-auto flex flex-col justify-center p-6 sm:p-12 relative z-10 border-l backdrop-blur-3xl \${isDarkMode ? "bg-[#0d0d11]/80 border-[#7D8C61]/30" : "bg-[#FFFFFF]/90 border-[#70ABAF]/20"}\`}>
            
            <div className="text-center space-y-4 mb-8">
              <motion.div
                initial={{ scale: 0, rotate: -180, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 220, damping: 14, delay: 0.15 }}
                whileHover={{ scale: 1.12, rotate: 8 }}
                className={\`w-16 h-16 border-2 rounded-2xl flex items-center justify-center mx-auto cursor-pointer group transition-all duration-300 relative overflow-hidden \${isDarkMode ? "bg-[#00F5D4]/10 text-[#00F5D4] border-[#00F5D4]/40 shadow-[0_0_25px_rgba(0,245,212,0.3),inset_0_0_10px_rgba(0,245,212,0.15)]" : "bg-[#70ABAF]/10 text-[#70ABAF] border-[#70ABAF]/40 shadow-[0_0_25px_rgba(112,171,175,0.3),inset_0_0_10px_rgba(112,171,175,0.15)]"}\`}
              >
                <motion.div
                  animate={{ y: [0, -3, 0], scale: [1, 1.04, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Stethoscope className={\`w-8 h-8 \${isDarkMode ? "text-[#00F5D4] drop-shadow-[0_0_12px_rgba(0,245,212,0.85)]" : "text-[#70ABAF] drop-shadow-[0_0_12px_rgba(112,171,175,0.85)]"}\`} />
                </motion.div>
              </motion.div>
              <h1 className={\`text-3xl sm:text-4xl font-serif font-bold tracking-tight \${isDarkMode ? "text-[#FAF9F6]" : "text-[#32292F]"}\`}>
                medisona
              </h1>
              <p className={\`text-sm leading-relaxed mx-auto font-sans \${isDarkMode ? "text-[#8C929D]" : "text-[#7A756D]"}\`}>
                Elite medical Board Prep syllabus console.
              </p>
            </div>

            {/* Toggle Tab */}
            <div className={\`p-1.5 rounded-2xl flex border mb-6 \${isDarkMode ? "bg-[#171A22]/90 border-[#1B1E26]" : "bg-[#F7FBF9] border-[#70ABAF]/15"}\`}>
              <button
                onClick={() => { setAuthMode("signin"); setAuthError(""); }}
                className={\`flex-1 py-3 text-xs font-mono uppercase tracking-wider rounded-xl transition-all duration-200 font-bold select-none cursor-pointer \${
                  authMode === "signin"
                    ? (isDarkMode ? "bg-[#0d0d11] text-[#7D8C61] shadow-sm border border-[#1B1E26]" : "bg-white text-[#70ABAF] shadow-sm border border-[#70ABAF]/15")
                    : (isDarkMode ? "text-[#8C929D] hover:text-[#FAF9F6]" : "text-[#7A756D] hover:text-[#32292F]")
                }\`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setAuthMode("signup"); setAuthError(""); }}
                className={\`flex-1 py-3 text-xs font-mono uppercase tracking-wider rounded-xl transition-all duration-200 font-bold select-none cursor-pointer \${
                  authMode === "signup"
                    ? (isDarkMode ? "bg-[#0d0d11] text-[#7D8C61] shadow-sm border border-[#1B1E26]" : "bg-white text-[#70ABAF] shadow-sm border border-[#70ABAF]/15")
                    : (isDarkMode ? "text-[#8C929D] hover:text-[#FAF9F6]" : "text-[#7A756D] hover:text-[#32292F]")
                }\`}
              >
                Create Account
              </button>
            </div>

            {authError && (
              <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 mb-6">
                {authError.toLowerCase().includes("unauthorized-domain") ? (
                  <div className={\`border p-4 rounded-2xl text-xs space-y-3 shadow-sm \${isDarkMode ? "bg-[#0d0d11]/80 border-[#C58B74]/50 text-[#FAF9F6]" : "bg-[#FAF9F6] border-[#C58B74]/50 text-[#423F3A]"}\`}>
                    <div className="flex items-start gap-2.5 text-[#C58B74] font-bold font-sans">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span className="uppercase tracking-wider">Authorized Domain Required</span>
                    </div>
                    <p className={\`leading-relaxed font-sans \${isDarkMode ? "text-[#8C929D]" : "text-[#7A756D]"}\`}>
                      Google Auth is pending setup because this environment's domain is not registered in your Firebase settings.
                    </p>
                    
                    <div className={\`border rounded-xl p-3 flex items-center justify-between gap-2 \${isDarkMode ? "bg-[#0a0a0e] border-[#1B1E26]" : "bg-[#FAF9F6] border-[#E6E2D8]"}\`}>
                      <div className={\`font-mono text-[11px] select-all overflow-hidden text-ellipsis whitespace-nowrap \${isDarkMode ? "text-[#FAF9F6]" : "text-[#5C5852]"}\`}>
                        {window.location.hostname}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(window.location.hostname);
                          setCopiedDomain(true);
                          setTimeout(() => setCopiedDomain(false), 2000);
                        }}
                        className={\`px-3 py-1.5 text-white rounded-lg text-[10px] font-mono uppercase font-bold transition-all flex items-center gap-1 shrink-0 cursor-pointer \${isDarkMode ? "bg-[#7D8C61] hover:bg-[#8A9A5B]" : "bg-[#70ABAF] hover:bg-[#5C9498]"}\`}
                      >
                        {copiedDomain ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedDomain ? "Copied" : "Copy"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#C58B74]/10 border border-[#C58B74]/30 text-[#C58B74] p-4 rounded-2xl text-xs font-mono leading-relaxed">
                    ⚠️ {authError}
                  </div>
                )}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {authMode === "signup" && (
                <div className="space-y-2">
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-[#7A756D] font-bold">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Dr. Jane Doe"
                    className={\`w-full p-3.5 border rounded-xl transition text-sm \${
                      isDarkMode 
                        ? "border-[#1B1E26] bg-[#050608]/50 focus:bg-[#0D0E12] text-[#FAF9F6] focus:border-[#7D8C61] focus:ring-1 focus:ring-[#7D8C61] placeholder:text-[#8C929D]/50" 
                        : "border-[#70ABAF]/20 bg-[#F7FBF9] focus:bg-white text-[#32292F] focus:border-[#70ABAF] focus:ring-1 focus:ring-[#70ABAF] placeholder:text-[#9A9489]"
                    }\`}
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-[10px] font-mono uppercase tracking-widest text-[#7A756D] font-bold">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className={\`absolute left-4 top-4 h-4 w-4 \${isDarkMode ? "text-[#8C929D]" : "text-[#9A9489]"}\`} />
                  <input
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="name@university.edu"
                    className={\`w-full pl-11 p-3.5 border rounded-xl transition text-sm \${
                      isDarkMode 
                        ? "border-[#1B1E26] bg-[#050608]/50 focus:bg-[#0D0E12] text-[#FAF9F6] focus:border-[#7D8C61] focus:ring-1 focus:ring-[#7D8C61] placeholder:text-[#8C929D]/50" 
                        : "border-[#70ABAF]/20 bg-[#F7FBF9] focus:bg-white text-[#32292F] focus:border-[#70ABAF] focus:ring-1 focus:ring-[#70ABAF] placeholder:text-[#9A9489]"
                    }\`}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-mono uppercase tracking-widest text-[#7A756D] font-bold">
                  Account Password
                </label>
                <div className="relative">
                  <Key className={\`absolute left-4 top-4 h-4 w-4 \${isDarkMode ? "text-[#8C929D]" : "text-[#9A9489]"}\`} />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    onFocus={() => setIsPasswordFocused(true)}
                    onBlur={() => setIsPasswordFocused(false)}
                    placeholder="••••••••"
                    className={\`w-full pl-11 p-3.5 border rounded-xl transition text-sm \${
                      isDarkMode 
                        ? "border-[#1B1E26] bg-[#050608]/50 focus:bg-[#0D0E12] text-[#FAF9F6] focus:border-[#7D8C61] focus:ring-1 focus:ring-[#7D8C61] placeholder:text-[#8C929D]/50" 
                        : "border-[#70ABAF]/20 bg-[#F7FBF9] focus:bg-white text-[#32292F] focus:border-[#70ABAF] focus:ring-1 focus:ring-[#70ABAF] placeholder:text-[#9A9489]"
                    }\`}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className={\`w-full py-4 rounded-xl text-xs font-mono uppercase tracking-widest font-bold transition-all duration-350 flex items-center justify-center gap-2 cursor-pointer \${
                  authLoading
                    ? (isDarkMode ? "bg-[#1B1E26] text-[#8C929D] cursor-not-allowed" : "bg-[#E6E2D8] text-[#9A9489] cursor-not-allowed")
                    : (isDarkMode ? "bg-[#7D8C61] hover:bg-[#8A9A5B] text-white shadow-md shadow-[#7D8C61]/10" : "bg-[#70ABAF] hover:bg-[#5C9498] text-[#F0F7F4] shadow-md shadow-[#70ABAF]/10")
                }\`}
              >
                {authLoading ? (
                  <div className={\`w-4 h-4 border-2 border-t-transparent rounded-full animate-spin \${isDarkMode ? "border-[#8C929D]" : "border-[#9A9489]"}\`}></div>
                ) : (
                  <>
                    {authMode === "signin" ? "Access Workspace" : "Register Credentials"}{" "}
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="relative flex py-2 items-center">
                <div className={\`flex-grow border-t \${isDarkMode ? "border-[#1B1E26]" : "border-[#E6E2D8]/60"}\`}></div>
                <span className={\`flex-shrink mx-4 text-[9px] font-mono uppercase tracking-widest \${isDarkMode ? "text-[#8C929D]" : "text-[#9A9489]"}\`}>or</span>
                <div className={\`flex-grow border-t \${isDarkMode ? "border-[#1B1E26]" : "border-[#E6E2D8]/60"}\`}></div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={authLoading}
                className={\`w-full py-3.5 px-4 border rounded-xl text-xs font-mono font-bold transition-all duration-200 flex items-center justify-center gap-3 shadow-sm cursor-pointer \${
                  authLoading ? "opacity-60 cursor-not-allowed" : ""
                } \${
                  isDarkMode 
                    ? "border-[#1B1E26] bg-[#0d0d11] hover:bg-[#171A22] text-[#FAF9F6] hover:border-[#7D8C61]" 
                    : "border-[#70ABAF]/20 bg-white hover:bg-[#F7FBF9] text-[#32292F] hover:border-[#70ABAF]"
                }\`}
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5.04c1.63 0 3.1.56 4.25 1.66l3.18-3.18C17.5 1.7 14.95 1 12 1 7.37 1 3.42 3.66 1.48 7.56l3.77 2.92C6.15 7.15 8.84 5.04 12 5.04z" />
                  <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.43h6.45c-.28 1.48-1.12 2.74-2.38 3.58v2.98h3.85c2.25-2.07 3.57-5.12 3.57-8.65z" />
                  <path fill="#FBBC05" d="M5.25 14.44a7.18 7.18 0 0 1 0-4.88V6.64H1.48a11.94 11.94 0 0 0 0 10.72l3.77-2.92z" />
                  <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.85-2.98c-1.07.72-2.45 1.15-4.11 1.15-3.16 0-5.85-2.11-6.8-5.44L1.41 15.75C3.35 19.64 7.33 23 12 23z" />
                </svg>
                {authMode === "signin" ? "Sign In with Google" : "Register with Google"}
              </button>
            </form>

            {/* Demo Sandbox Mode */}
            <div className={\`text-center mt-6 pt-6 border-t \${isDarkMode ? "border-[#1B1E26]" : "border-[#E6E2D8]/50"}\`}>
              <span className={\`text-[10px] font-mono block mb-2 uppercase tracking-wide \${isDarkMode ? "text-[#8C929D]" : "text-[#9A9489]"}\`}>Or explore immediately:</span>
              <button
                onClick={handleDemoMode}
                className={\`text-xs font-mono font-bold underline transition \${isDarkMode ? "text-[#7D8C61] hover:text-[#8A9A5B]" : "text-[#70ABAF] hover:text-[#5C9498]"}\`}
              >
                Launch Sandbox Mode (Offline Demo)
              </button>
            </div>
            
          </div>
        </div>`;

code = code.substring(0, startIndex) + replacement + code.substring(endIndex);

fs.writeFileSync('src/App.tsx', code);
