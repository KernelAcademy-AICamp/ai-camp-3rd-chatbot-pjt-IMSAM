"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Sparkles, Code, Palette, Cpu, Globe } from "lucide-react";

const skills = [
  { icon: Palette, label: "Product Design", level: 98 },
  { icon: Code, label: "Frontend Development", level: 95 },
  { icon: Cpu, label: "AI/ML Engineering", level: 92 },
  { icon: Globe, label: "System Architecture", level: 90 },
];

const techStack = [
  "React", "TypeScript", "Next.js", "Framer Motion",
  "Python", "LangChain", "LangGraph", "OpenAI",
  "Supabase", "PostgreSQL", "WebSocket", "TailwindCSS"
];

export function AboutSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-32 relative overflow-hidden" ref={ref}>
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-navy/20 to-background" />

      <div className="container relative mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto text-center mb-20"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-mint/10 text-mint text-sm font-medium mb-6">
            About the Creator
          </span>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            Made with{" "}
            <span className="text-gradient-mint">Passion & Precision</span>
          </h2>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Creator Card */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="glass-card rounded-3xl p-8 lg:p-10">
                {/* Avatar */}
                <div className="flex items-center gap-6 mb-8">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-mint to-soft-blue flex items-center justify-center">
                      <Sparkles className="w-10 h-10 text-navy" />
                    </div>
                    <motion.div
                      className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-mint flex items-center justify-center"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <span className="text-navy text-xs font-bold">AI</span>
                    </motion.div>
                  </div>
                  <div>
                    <h3 className="font-display text-2xl font-bold text-foreground">
                      IMSAM Creator
                    </h3>
                    <p className="text-mint font-medium">
                      AI Product Designer & Engineer
                    </p>
                  </div>
                </div>

                {/* Philosophy */}
                <div className="mb-8">
                  <h4 className="font-semibold text-foreground mb-3">Design Philosophy</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    "기술은 인간의 가능성을 확장하는 도구입니다.
                    IMSAM은 모든 사람이 자신의 잠재력을 발견하고
                    성장할 수 있도록 설계되었습니다.
                    Human-centric AI로 면접이라는 스트레스 상황에서도
                    최선의 모습을 보여줄 수 있도록 돕습니다."
                  </p>
                </div>

                {/* Skills */}
                <div>
                  <h4 className="font-semibold text-foreground mb-4">Core Skills</h4>
                  <div className="space-y-4">
                    {skills.map((skill, index) => (
                      <motion.div
                        key={skill.label}
                        initial={{ opacity: 0, x: -20 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <skill.icon className="w-4 h-4 text-mint" />
                            <span className="text-sm font-medium text-foreground">
                              {skill.label}
                            </span>
                          </div>
                          <span className="text-sm text-muted-foreground">{skill.level}%</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-mint to-soft-blue rounded-full"
                            initial={{ width: 0 }}
                            animate={isInView ? { width: `${skill.level}%` } : {}}
                            transition={{ duration: 1, delay: 0.6 + index * 0.1 }}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Tech Stack & Brand */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="space-y-8"
            >
              {/* Tech Stack */}
              <div className="glass-card rounded-2xl p-6">
                <h4 className="font-semibold text-foreground mb-4">Tech Stack</h4>
                <div className="flex flex-wrap gap-2">
                  {techStack.map((tech, index) => (
                    <motion.span
                      key={tech}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={isInView ? { opacity: 1, scale: 1 } : {}}
                      transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
                      className="px-3 py-1.5 rounded-lg bg-secondary/50 text-sm font-medium text-foreground hover:bg-mint/10 hover:text-mint transition-colors cursor-default"
                    >
                      {tech}
                    </motion.span>
                  ))}
                </div>
              </div>

              {/* Brand Identity */}
              <div className="glass-card rounded-2xl p-6">
                <h4 className="font-semibold text-foreground mb-4">Brand Identity</h4>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="w-full aspect-square rounded-xl bg-navy mb-2" />
                    <span className="text-xs text-muted-foreground">Midnight Navy</span>
                  </div>
                  <div className="text-center">
                    <div className="w-full aspect-square rounded-xl bg-mint mb-2" />
                    <span className="text-xs text-muted-foreground">Electric Mint</span>
                  </div>
                  <div className="text-center">
                    <div className="w-full aspect-square rounded-xl bg-soft-blue mb-2" />
                    <span className="text-xs text-muted-foreground">Soft Blue</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-20">Display:</span>
                    <span className="font-display text-sm text-foreground">Sora</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-20">Body:</span>
                    <span className="text-sm text-foreground">Inter</span>
                  </div>
                </div>
              </div>

              {/* Logo Preview */}
              <div className="glass-card rounded-2xl p-6">
                <h4 className="font-semibold text-foreground mb-4">Logo</h4>
                <div className="flex items-center justify-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-mint to-soft-blue flex items-center justify-center shadow-mint">
                    <span className="font-display font-bold text-navy text-2xl">IM</span>
                  </div>
                  <div className="text-left">
                    <p className="font-display text-2xl font-bold text-foreground">IMSAM</p>
                    <p className="text-sm text-muted-foreground">
                      Interview Master - Smart AI Mentor
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
