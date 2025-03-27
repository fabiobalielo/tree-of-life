"use client";

import React, { useRef, useState } from "react";
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

interface KabbalahPageProps {
  tree?: TreeOfLife;
}

export default function KabbalahPage({
  tree = traditionalTreeOfLife,
}: KabbalahPageProps) {
  const visualizationRef = useRef<TreeOfLifeVisualizationRef>(null);
  const [currentTree, setCurrentTree] = useState<TreeOfLife>(tree);
  const [activeTab, setActiveTab] = useState<string>("interpretation");

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState({
    title: "",
    description: "",
    type: "", // "sephirah" or "path"
    details: {} as Record<string, any>,
    interpretation: "", // Store personalized interpretation
  });

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

  return (
    <div className="w-full h-full flex flex-row bg-[var(--background)] text-[var(--foreground)]">
      {/* Tree Visualization Panel - Left Side */}
      <div className="w-[65%] h-full flex flex-col overflow-hidden">
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

        <div className="flex-1 relative">
          <TreeOfLifeVisualization
            ref={visualizationRef}
            tree={currentTree}
            onSephirahClick={handleSephirahClick}
            onPathClick={handlePathClick}
          />
        </div>
      </div>

      {/* Chat Panel - Right Side */}
      <div className="w-[35%] h-full border-l border-[var(--border)] shadow-lg">
        <KabbalahChat onTreeUpdate={handleTreeUpdate} />
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[var(--card)] border-[var(--primary)]/20 max-w-md">
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
                  className="text-xs text-muted-foreground ml-1"
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
                  className="text-xs text-muted-foreground ml-1"
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
