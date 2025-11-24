"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BookOpen,
  Leaf,
  Cpu,
  Palette,
  Heart,
  Users,
  LayoutGrid,
} from "lucide-react";
import { DonationOverlay } from "@/components/donation-overlay";
import projectsData from "@/data/projects.json";
import { useReadContract } from "wagmi";
import { abi } from "@/lib/abi";
import { tokenAbi } from "@/lib/tokenAbi";
import { formatEther } from "viem";
import { useAppKitAccount } from "@reown/appkit/react";

// normalize a single campaign returned by the contract (tuple or object)
function normalizeCampaign(raw: any) {
  const get = (i: number, name?: string) =>
    Array.isArray(raw) ? raw[i] : raw[name ?? ""];

  const id = Number(get(0, "id"));
  const title = String(get(1, "title") ?? "");
  const description = String(get(2, "description") ?? "");
  const category = String(get(3, "category") ?? "");
  const creator = String(get(4, "creator") ?? "");

  const rawGoal = get(5, "goal");
  const rawPledged = get(6, "pledged");

  // keep raw values for formatting with formatEther, and also expose numeric ETH values for calculations
  const goalNumber = parseFloat(formatEther(rawGoal));
  const pledgedNumber = parseFloat(formatEther(rawPledged));

  const endAt = Number(get(7, "endAt"));
  const claimed = Boolean(get(8, "claimed"));

  const now = Math.floor(Date.now() / 1000);
  const daysLeft = Math.max(0, Math.ceil((endAt - now) / (60 * 60 * 24)));

  return {
    id,
    title,
    description,
    category,
    creator,
    // raw on-chain values (keep for formatEther)
    goal: rawGoal,
    pledged: rawPledged,
    // numeric ETH floats for UI calculations
    goalNumber,
    pledgedNumber,
    raised: rawPledged,
    raisedNumber: pledgedNumber,
    endAt,
    daysLeft,
    claimed,
    _raw: raw,
  };
}

const categoryIcons = {
  All: LayoutGrid,
  Education: BookOpen,
  Environment: Leaf,
  Technology: Cpu,
  "Arts & Culture": Palette,
  Wellness: Heart,
  Community: Users,
};

const categoryColors = {
  All: "text-blue-400",
  Education: "text-purple-400",
  Environment: "text-green-400",
  Technology: "text-cyan-400",
  "Arts & Culture": "text-pink-400",
  Wellness: "text-red-400",
  Community: "text-yellow-400",
};

export default function ProjectPage() {
  // useParams() is the supported way to access route params inside a client component
  const params = useParams();
  const idParam = params?.id;
  // convert route id (string) to a number for contract calls
  const idAsNumber = idParam ? Number(idParam) : undefined;
  const { address } = useAppKitAccount();

  const allowance = useReadContract({
    abi: tokenAbi,
    address: "0x0bBB9cbe749207d91fa0928633600Cb95930496B",
    functionName: "allowance",
    args: [address, "0x0b11251987217fE348E68A1308D9746C104AEFBA"],
  });

  const result = useReadContract({
    abi,
    address: "0x0b11251987217fE348E68A1308D9746C104AEFBA",
    functionName: "campaigns",
    args: idAsNumber !== undefined ? [idAsNumber] : undefined,
  });

  const [isDonationOverlayOpen, setIsDonationOverlayOpen] = useState(false);
  const [singleProjectData, setsingleProjectData] = useState<any>(null);
  // const project = projectsData.find((p) => p.id === idAsNumber);
  const project = singleProjectData;

  // copy and normalize data once it becomes available
  useEffect(() => {
    if (result?.data) {
      const normalized = normalizeCampaign(result.data);
      setsingleProjectData(normalized as any);
    }
  }, [result?.data]);

  // if project data isn't loaded yet, show a small loading state until useReadContract returns
  if (!project) {
    return <div className="text-center py-8">Loading project…</div>;
  }

  const progress = project.goalNumber
    ? (project.raisedNumber / project.goalNumber) * 100
    : 0;
  const Icon = categoryIcons[project.category as keyof typeof categoryIcons];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-3xl">{project.title}</CardTitle>
            <div className="flex items-center">
              <Icon
                className={`w-6 h-6 mr-2 ${
                  categoryColors[
                    project.category as keyof typeof categoryColors
                  ]
                }`}
              />
              <span
                className={`text-lg ${
                  categoryColors[
                    project.category as keyof typeof categoryColors
                  ]
                }`}
              >
                {project.category}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-48 md:h-64 lg:h-80 max-w-2xl mx-auto mb-6 relative">
            <Image
              src={"/project-image.jpg"}
              alt={project.title}
              width={800}
              height={400}
              className="object-cover rounded-md w-full h-full"
            />
          </div>
          {/* <p className="text-xl mb-6">{project.description}</p> */}
          <div className="space-y-4">
            <Progress value={progress} className="h-4" />
            <div className="flex justify-between text-lg">
              <span>${formatEther(project.pledged)} raised</span>
              <span>${formatEther(project.goal)} goal</span>
            </div>
            <p className="text-muted-foreground">
              {project.daysLeft} days left to fund this project
            </p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <Button
            size="lg"
            className="w-full"
            onClick={() => setIsDonationOverlayOpen(true)}
          >
            Support This Project
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>About This Project</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{project.description}</p>
          {/* <p className="mt-4">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat.
          </p> */}
        </CardContent>
      </Card>
      <DonationOverlay
        isOpen={isDonationOverlayOpen}
        onClose={() => setIsDonationOverlayOpen(false)}
        projectTitle={project.title}
        projectId={project.id}
        allowance={allowance.data}
      />
    </div>
  );
}
