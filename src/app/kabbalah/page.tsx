"use client";

import React, { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  RotateCw,
  ZoomIn,
  ZoomOut,
  User,
  BookOpen,
  Sparkles,
  Link2,
  Info,
  ChevronRight,
  ChevronLeft,
  Menu,
  X,
  MessageCircle,
  HelpCircle,
  Home,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TreeOfLife } from "@/app/models/TreeOfLife.interface";
import traditionalTreeOfLife from "@/data/kabbalah/TreeOfLifeData";
import TreeOfLifeVisualization, {
  TreeOfLifeVisualizationRef,
} from "@/components/kabbalah/TreeOfLifeVisualization";
import { KabbalahChat } from "@/components/kabbalah/chat";
import { motion, AnimatePresence } from "framer-motion";

export default function KabbalahPage() {
  const visualizationRef = useRef<TreeOfLifeVisualizationRef>(null);
  const [currentTree, setCurrentTree] = useState<TreeOfLife>(
    traditionalTreeOfLife
  );
  const [activeTab, setActiveTab] = useState<string>("interpretation");
  const [isMobile, setIsMobile] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [touchStartY, setTouchStartY] = useState(0);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState({
    title: "",
    description: "",
    type: "", // "sephirah" or "path"
    details: {} as Record<string, any>,
    interpretation: "", // Store personalized interpretation
  });

  // Check if the viewport is mobile-sized
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkIfMobile();

    // Add event listener
    window.addEventListener("resize", checkIfMobile);

    // Show tutorial only on first load on mobile
    if (window.innerWidth < 768) {
      const hasSeenTutorial = localStorage.getItem("kabbalah_tutorial_seen");
      if (!hasSeenTutorial) {
        setShowTutorial(true);
        localStorage.setItem("kabbalah_tutorial_seen", "true");
      }
    }

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  const resetCamera = () => {
    visualizationRef.current?.resetCamera();
  };

  const zoomIn = () => {
    visualizationRef.current?.zoomIn();
  };

  const zoomOut = () => {
    visualizationRef.current?.zoomOut();
  };

  const handleSephirahClick = (sephirah: any) => {
    setDialogContent({
      title: sephirah.title || sephirah.name,
      description: sephirah.description || "",
      type: "sephirah",
      details: {
        hebrewName: sephirah.hebrewName,
        number: sephirah.number,
        world: sephirah.world,
        pillar: sephirah.pillar,
        divineName: sephirah.divineName,
        archangel: sephirah.archangel,
        angelicChoir: sephirah.angelicChoir,
        spiritualExperience: sephirah.spiritualExperience,
        virtue: sephirah.virtue,
        vice: sephirah.vice,
        color: sephirah.color,
      },
      interpretation: sephirah.interpretation || sephirah.description || "",
    });
    setDialogOpen(true);
  };

  const handlePathClick = (path: any) => {
    setDialogContent({
      title: path.title || path.name,
      description: path.description || "",
      type: "path",
      details: {
        connection: `${path.sourceName} to ${path.targetName}`,
        hebrewLetter: path.hebrewLetter,
        tarotCard: path.tarotCard,
        element: path.element,
        astrologicalCorrespondence: path.astrologicalCorrespondence,
      },
      interpretation: path.interpretation || path.description || "",
    });
    setDialogOpen(true);
  };

  const handleTreeUpdate = (updatedTree: TreeOfLife) => {
    console.log("Page received tree update, applying to state:", updatedTree);
    setCurrentTree(updatedTree);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const toggleChat = () => {
    setShowChat(!showChat);
    // Reset view when toggling to ensure proper rendering
    if (visualizationRef.current) {
      setTimeout(() => {
        resetCamera();
      }, 100);
    }
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Handle touch gestures for swiping up to show chat
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndY = e.changedTouches[0].clientY;
    const deltaY = touchStartY - touchEndY;

    // If swipe up > 50px, show chat
    if (deltaY > 50 && !showChat && isMobile) {
      setShowChat(true);
    }
    // If swipe down > 50px, hide chat
    else if (deltaY < -50 && showChat && isMobile) {
      setShowChat(false);
    }
  };

  return (
    <div
      className="w-full h-full flex flex-col md:flex-row bg-[var(--background)] text-[var(--foreground)] relative"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Tutorial Dialog (only shown on first visit) */}
      <Dialog open={showTutorial} onOpenChange={setShowTutorial}>
        <DialogContent className="bg-[var(--card)] border-[var(--primary)]/20 max-w-[90vw] md:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-[var(--primary)]" />
              Welcome to Tree of Life
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="bg-[var(--primary-foreground)]/5 p-3 rounded-md border border-[var(--primary)]/10">
              <p className="text-[var(--foreground)]/90 text-sm leading-relaxed">
                To navigate this visualization:
              </p>
              <ul className="mt-2 space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="text-[var(--primary)] rounded-full border border-[var(--primary)] p-1 inline-flex">
                    <ChevronLeft className="w-4 h-4" />
                  </span>
                  <span>
                    Swipe up or tap the chat button to explore conversations
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[var(--primary)] rounded-full border border-[var(--primary)] p-1 inline-flex">
                    <ZoomIn className="w-4 h-4" />
                  </span>
                  <span>Pinch to zoom the visualization</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[var(--primary)] rounded-full border border-[var(--primary)] p-1 inline-flex">
                    <Menu className="w-4 h-4" />
                  </span>
                  <span>Tap menu for additional options</span>
                </li>
              </ul>
            </div>
            <Button className="w-full" onClick={() => setShowTutorial(false)}>
              Start Exploring
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Mobile Header */}
      {isMobile && (
        <div className="w-full p-3 border-b border-[var(--border)] bg-[var(--card-80)] backdrop-blur-sm flex justify-between items-center z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMenu}
            className="md:hidden"
          >
            {menuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
          <h1 className="text-lg font-bold">Kabbalah Tree of Life</h1>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleChat}
            className="md:hidden"
          >
            {showChat ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <MessageCircle className="h-5 w-5" />
            )}
          </Button>
        </div>
      )}

      {/* Mobile Menu with Animation */}
      <AnimatePresence>
        {isMobile && menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="absolute top-[53px] left-0 w-full bg-[var(--card)] z-20 border-b border-[var(--border)] shadow-md"
          >
            <div className="p-3 flex flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  resetCamera();
                  setMenuOpen(false);
                }}
                className="w-full justify-start"
              >
                <RotateCw className="h-4 w-4 mr-2" />
                Reset View
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    zoomIn();
                    setMenuOpen(false);
                  }}
                  className="flex-1"
                >
                  <ZoomIn className="h-4 w-4 mr-2" />
                  Zoom In
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    zoomOut();
                    setMenuOpen(false);
                  }}
                  className="flex-1"
                >
                  <ZoomOut className="h-4 w-4 mr-2" />
                  Zoom Out
                </Button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowTutorial(true);
                  setMenuOpen(false);
                }}
                className="w-full justify-start text-[var(--muted-foreground)]"
              >
                <HelpCircle className="h-4 w-4 mr-2" />
                Show Tutorial
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tree Visualization Panel */}
      <div
        className={cn(
          "h-full flex flex-col overflow-hidden transition-all duration-300 ease-in-out",
          isMobile
            ? showChat
              ? "w-0 opacity-0"
              : "w-full opacity-100"
            : "w-[65%]"
        )}
      >
        {/* Desktop Header */}
        {!isMobile && (
          <div className="p-4 border-b border-[var(--border)] bg-[var(--card-80)] backdrop-blur-sm flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Kabbalah Tree of Life</h1>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">
                Interactive 3D visualization of the mystic tree
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={resetCamera}
                className="border-[var(--primary)] hover:bg-[var(--primary)]/10"
              >
                <RotateCw className="h-4 w-4 mr-2" />
                Reset View
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={zoomIn}
                className="border-[var(--secondary)] hover:bg-[var(--secondary)]/10"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={zoomOut}
                className="border-[var(--secondary)] hover:bg-[var(--secondary)]/10"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        <div
          className={cn(
            "flex-1 relative",
            isMobile && !showChat ? "block" : ""
          )}
        >
          <TreeOfLifeVisualization
            ref={visualizationRef}
            tree={currentTree}
            onSephirahClick={handleSephirahClick}
            onPathClick={handlePathClick}
          />
        </div>
      </div>

      {/* Chat Panel with Slide Animation for Mobile */}
      <AnimatePresence>
        <motion.div
          layout
          className={cn(
            "h-full border-l border-[var(--border)] shadow-lg",
            isMobile ? (showChat ? "w-full" : "w-0 opacity-0") : "w-[35%]"
          )}
          initial={isMobile ? { y: "100%" } : false}
          animate={isMobile && showChat ? { y: 0 } : {}}
          exit={isMobile ? { y: "100%" } : {}}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {/* Mobile Chat Header */}
          {isMobile && showChat && (
            <div className="p-3 border-b border-[var(--border)] bg-[var(--card-80)] flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[var(--primary)]" />
                <h2 className="text-lg font-semibold">Kabbalah Guide</h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleChat}
                className="md:hidden"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          )}

          {/* Only render chat when it should be visible */}
          {(!isMobile || showChat) && (
            <KabbalahChat onTreeUpdate={handleTreeUpdate} />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Mobile Chat Indicator (when chat is not visible) */}
      {isMobile && !showChat && (
        <div className="absolute bottom-24 left-0 right-0 flex justify-center pointer-events-none z-10">
          <div className="bg-[var(--card)]/70 backdrop-blur-sm px-4 py-2 rounded-full text-xs text-[var(--muted-foreground)] border border-[var(--border)] shadow-md flex items-center gap-2 animate-pulse">
            <ChevronLeft className="h-3 w-3 transform rotate-90" />
            <span>Swipe up for insights</span>
          </div>
        </div>
      )}

      {/* Mobile Toggle Button (when chat is not visible) */}
      {isMobile && !showChat && (
        <Button
          variant="outline"
          size="sm"
          onClick={toggleChat}
          className="absolute bottom-6 right-6 z-10 rounded-full w-12 h-12 shadow-lg bg-[var(--primary)]/90 hover:bg-[var(--primary)] border-none text-white"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[var(--card)] border-[var(--primary)]/20 max-w-[90vw] md:max-w-md mx-2">
          <DialogHeader>
            <DialogTitle
              className={cn(
                "flex items-center gap-2",
                dialogContent.type === "sephirah"
                  ? "text-xl text-[var(--primary)]"
                  : "text-lg text-[var(--accent)]"
              )}
            >
              {dialogContent.type === "sephirah" ? (
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm"
                  style={{
                    backgroundColor: dialogContent.details.color
                      ? `#${Number(dialogContent.details.color)
                          .toString(16)
                          .padStart(6, "0")}`
                      : "#ffffff",
                  }}
                >
                  {dialogContent.details.number}
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{
                      backgroundColor: dialogContent.details.color
                        ? `#${Number(dialogContent.details.color)
                            .toString(16)
                            .padStart(6, "0")}`
                        : "#ffffff",
                    }}
                  ></div>
                  <Link2 className="w-4 h-4" />
                </div>
              )}
              {dialogContent.title}
            </DialogTitle>
          </DialogHeader>

          <Tabs
            defaultValue="interpretation"
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger
                value="interpretation"
                className={cn(
                  "flex items-center gap-2 cursor-pointer opacity-50",
                  activeTab === "interpretation" ? "opacity-100" : ""
                )}
              >
                <User className="w-4 h-4" />
                <span>Interpretation</span>
                <span
                  className="text-xs text-muted-foreground ml-1 hidden md:inline-block"
                  title="Personalized interpretation based on your conversation"
                >
                  <Info className="w-3 h-3" />
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="traditional"
                className={cn(
                  "flex items-center gap-2 cursor-pointer opacity-50",
                  activeTab === "traditional" ? "opacity-100" : ""
                )}
              >
                <BookOpen className="w-4 h-4" />
                <span>Essence</span>
                <span
                  className="text-xs text-muted-foreground ml-1 hidden md:inline-block"
                  title="Traditional Kabbalistic meaning"
                >
                  <Info className="w-3 h-3" />
                </span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="interpretation" className="pt-4">
              <div className="bg-[var(--primary-foreground)]/5 p-3 rounded-md border border-[var(--primary)]/10">
                <p className="text-[var(--foreground)]/90 text-sm leading-relaxed">
                  {dialogContent.interpretation ||
                    "No personalized interpretation available."}
                </p>
              </div>
            </TabsContent>

            <TabsContent value="traditional" className="pt-4">
              {/* Traditional description if available */}
              {dialogContent.description && (
                <div className="mb-4 bg-[var(--muted)]/10 p-3 rounded-md border border-[var(--muted)]/20">
                  <p className="text-[var(--foreground)]/80 text-sm leading-relaxed">
                    {dialogContent.description}
                  </p>
                </div>
              )}

              {/* Traditional details based on type */}
              <div className="text-sm flex flex-col gap-1.5 bg-[var(--card-30)] rounded-md p-3 border border-[var(--border)]">
                {dialogContent.type === "sephirah" && (
                  <>
                    {dialogContent.details.hebrewName && (
                      <div className="flex justify-between">
                        <span className="font-semibold">Hebrew Name:</span>
                        <span className="text-right">
                          {dialogContent.details.hebrewName}
                        </span>
                      </div>
                    )}
                    {dialogContent.details.number && (
                      <div className="flex justify-between">
                        <span className="font-semibold">Number:</span>
                        <span className="text-right">
                          {dialogContent.details.number}
                        </span>
                      </div>
                    )}
                    {dialogContent.details.world && (
                      <div className="flex justify-between">
                        <span className="font-semibold">World:</span>
                        <span className="text-right">
                          {dialogContent.details.world}
                        </span>
                      </div>
                    )}
                    {dialogContent.details.pillar && (
                      <div className="flex justify-between">
                        <span className="font-semibold">Pillar:</span>
                        <span className="text-right">
                          {dialogContent.details.pillar}
                        </span>
                      </div>
                    )}
                    {dialogContent.details.divineName && (
                      <div className="flex justify-between">
                        <span className="font-semibold">Divine Name:</span>
                        <span className="text-right">
                          {dialogContent.details.divineName}
                        </span>
                      </div>
                    )}
                    {dialogContent.details.archangel && (
                      <div className="flex justify-between">
                        <span className="font-semibold">Archangel:</span>
                        <span className="text-right">
                          {dialogContent.details.archangel}
                        </span>
                      </div>
                    )}
                    {dialogContent.details.spiritualExperience && (
                      <div className="flex justify-between">
                        <span className="font-semibold">
                          Spiritual Experience:
                        </span>
                        <span className="text-right">
                          {dialogContent.details.spiritualExperience}
                        </span>
                      </div>
                    )}
                    {dialogContent.details.virtue && (
                      <div className="flex justify-between">
                        <span className="font-semibold">Virtue:</span>
                        <span className="text-right">
                          {dialogContent.details.virtue}
                        </span>
                      </div>
                    )}
                    {dialogContent.details.vice &&
                      dialogContent.details.vice !== "None" && (
                        <div className="flex justify-between">
                          <span className="font-semibold">Vice:</span>
                          <span className="text-right">
                            {dialogContent.details.vice}
                          </span>
                        </div>
                      )}
                  </>
                )}

                {dialogContent.type === "path" && (
                  <>
                    {dialogContent.details.connection && (
                      <div className="flex justify-between">
                        <span className="font-semibold">Connection:</span>
                        <span className="text-right">
                          {dialogContent.details.connection}
                        </span>
                      </div>
                    )}
                    {dialogContent.details.hebrewLetter && (
                      <div className="flex justify-between">
                        <span className="font-semibold">Hebrew Letter:</span>
                        <span className="text-right">
                          {dialogContent.details.hebrewLetter}
                        </span>
                      </div>
                    )}
                    {dialogContent.details.tarotCard && (
                      <div className="flex justify-between">
                        <span className="font-semibold">Tarot Card:</span>
                        <span className="text-right">
                          {dialogContent.details.tarotCard}
                        </span>
                      </div>
                    )}
                    {dialogContent.details.element && (
                      <div className="flex justify-between">
                        <span className="font-semibold">Element:</span>
                        <span className="text-right">
                          {dialogContent.details.element}
                        </span>
                      </div>
                    )}
                    {dialogContent.details.astrologicalCorrespondence && (
                      <div className="flex justify-between">
                        <span className="font-semibold">Astrological:</span>
                        <span className="text-right">
                          {dialogContent.details.astrologicalCorrespondence}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
