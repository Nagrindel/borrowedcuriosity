import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Play, X, ChevronRight, BookOpen, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import Comments from "@/components/comments";

const fadeUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 } };
const stagger = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } };

interface Lesson { id: number; title: string; description: string; content: string | null; orderIndex: number; }
interface Course { id: number; title: string; description: string; gradient: string; imageUrl: string | null; lessons: Lesson[]; lessonCount: number; }

export default function Courses() {
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [activeLesson, setActiveLesson] = useState<number | null>(null);

  const { data: courses = [], isLoading } = useQuery<Course[]>({
    queryKey: ["courses"],
    queryFn: () => apiRequest("/api/courses"),
  });

  const openCourse = (course: Course) => {
    setActiveCourse(course);
    setActiveLesson(null);
    document.body.style.overflow = "hidden";
  };

  const closeCourse = () => {
    setActiveCourse(null);
    setActiveLesson(null);
    document.body.style.overflow = "";
  };

  return (
    <div className="min-h-screen pt-16">
      <section className="section-padding min-h-[40vh] flex items-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-brand-500/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
        </div>
        <div className="max-w-7xl mx-auto w-full relative z-10">
          <motion.div {...fadeUp}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs font-medium text-brand-500 mb-6">
              <GraduationCap className="w-3.5 h-3.5" /> Learn for free
            </span>
          </motion.div>
          <motion.h1 {...fadeUp} transition={{ duration: 0.6, delay: 0.1 }} className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6">
            Free <span className="text-gradient">Courses</span>
          </motion.h1>
          <motion.p {...fadeUp} transition={{ duration: 0.6, delay: 0.2 }} className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl">
            No paywall. No catch. Just learning. Borrowed wisdom, freely given.
          </motion.p>
        </div>
      </section>

      <section className="section-padding pt-0">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course, i) => (
                <motion.div key={course.id} {...stagger} transition={{ duration: 0.5, delay: i * 0.1 }}>
                  <div className="glass-card h-full flex flex-col">
                    <div className={`w-full aspect-video rounded-xl bg-gradient-to-br ${course.gradient} mb-4 overflow-hidden flex items-center justify-center`}>
                      {course.imageUrl ? (
                        <img src={course.imageUrl} alt={course.title} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      ) : (
                        <GraduationCap className="w-10 h-10 text-white/70" />
                      )}
                    </div>
                    <h3 className="font-display text-xl font-semibold mb-2">{course.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4 flex-1">{course.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-brand-500">{course.lessonCount} lessons</span>
                      <button className="btn-primary text-sm py-2 px-4 flex items-center gap-2" onClick={() => openCourse(course)}>
                        Start Learning <Play className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── Full-Screen Course Modal ─── */}
      <AnimatePresence>
        {activeCourse && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[100] flex"
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeCourse} />

            {/* Modal */}
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="relative z-10 w-full max-w-4xl mx-auto my-4 sm:my-8 flex flex-col"
            >
              <div className="glass-strong rounded-2xl flex flex-col overflow-hidden flex-1 min-h-0" style={{ maxHeight: "calc(100vh - 4rem)" }}>

                {/* Header */}
                <div className="shrink-0 p-5 sm:p-6 border-b border-white/5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      {activeCourse.imageUrl ? (
                        <img src={activeCourse.imageUrl} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0" />
                      ) : (
                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${activeCourse.gradient} flex items-center justify-center shrink-0`}>
                          <GraduationCap className="w-7 h-7 text-white" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <h2 className="font-display text-xl sm:text-2xl font-bold truncate">{activeCourse.title}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{activeCourse.lessonCount} lessons</p>
                      </div>
                    </div>
                    <button onClick={closeCourse}
                      className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors shrink-0">
                      <X className="w-4.5 h-4.5" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mt-3">{activeCourse.description}</p>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-3">
                  {activeCourse.lessons.length === 0 ? (
                    <div className="text-center py-16">
                      <BookOpen className="w-12 h-12 text-gray-600 opacity-30 mx-auto mb-3" />
                      <p className="text-sm text-gray-500">Lessons coming soon.</p>
                    </div>
                  ) : (
                    activeCourse.lessons.map((lesson, idx) => {
                      const isOpen = activeLesson === lesson.id;
                      return (
                        <div key={lesson.id} className="glass rounded-xl overflow-hidden">
                          <button
                            onClick={() => setActiveLesson(isOpen ? null : lesson.id)}
                            className="w-full flex items-center gap-4 p-4 text-left hover:bg-white/3 transition-colors"
                          >
                            <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm font-bold ${isOpen ? "bg-brand-500 text-white" : "bg-brand-500/15 text-brand-400"}`}>
                              {idx + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm">{lesson.title}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{lesson.description}</p>
                            </div>
                            <ChevronRight className={`w-4 h-4 text-gray-500 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`} />
                          </button>

                          <AnimatePresence>
                            {isOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25 }}
                                className="overflow-hidden"
                              >
                                <div className="px-4 pb-4 pt-0">
                                  <div className="h-px bg-white/5 mb-4" />
                                  {lesson.content ? (
                                    <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                                      {lesson.content}
                                    </div>
                                  ) : (
                                    <p className="text-sm text-gray-500 italic">{lesson.description}</p>
                                  )}
                                  {idx < activeCourse.lessons.length - 1 && (
                                    <button
                                      onClick={() => setActiveLesson(activeCourse.lessons[idx + 1].id)}
                                      className="mt-4 btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
                                    >
                                      Next Lesson <ChevronRight className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })
                  )}

                  {/* Comments Section */}
                  <div className="pt-4">
                    <Comments targetType="course" targetId={activeCourse.id} />
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
