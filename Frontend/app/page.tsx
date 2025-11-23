"use client";

import { useState, useEffect } from "react";
import { ProjectCard } from "@/components/project-card";
import { CategoryFilter } from "@/components/category-filter";
import { Button } from "@/components/ui/button";
import projectsData from "@/data/projects.json";
import { StartProjectOverlay } from "@/components/start-project-overlay";
import { useReadContract } from "wagmi";
import { abi } from "@/lib/abi";
import { read } from "node:fs";

const categories = Array.from(
  new Set(projectsData.map((project) => project.category))
);

export default function Home() {
  const result = useReadContract({
    abi,
    address: "0x0b11251987217fE348E68A1308D9746C104AEFBA",
    functionName: "getAllCampaigns",
  });

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isStartProjectOpen, setIsStartProjectOpen] = useState(false);
  const [contractData, setContractData] = useState<any[]>([]);

  console.log("Result From Contract Read: ", result.data);
  const filteredProjects =
    selectedCategory === "All"
      ? contractData
      : contractData.filter((project) => project.category === selectedCategory);

  // copy data once it becomes available
  useEffect(() => {
    if (result?.data) {
      // optionally transform/normalize here
      setContractData(result.data as any[]);
    }
  }, [result?.data]);

  return (
    <div className="space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-5xl tracking-tight">Support a project today</h1>
        <p className="text-xl text-muted-foreground">
          Discover and fund amazing projects that make a difference in the web3
          space.
        </p>
        <Button
          size="lg"
          className="mt-4"
          onClick={() => setIsStartProjectOpen(true)}
        >
          Start a Project
        </Button>
      </div>
      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredProjects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
      <StartProjectOverlay
        isOpen={isStartProjectOpen}
        onClose={() => setIsStartProjectOpen(false)}
      />
    </div>
  );
}
