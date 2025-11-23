import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  Leaf,
  Cpu,
  Palette,
  Heart,
  Users,
  LayoutGrid,
} from "lucide-react";

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

interface Project {
  id: number;
  title: string;
  description: string;
  category: string;
  address: string;
  // goal/pledged come from on-chain data and may be BigInt or BigNumber; keep flexible
  goal: number | string | bigint | { toString(): string };
  pledged: number | string | bigint | { toString(): string };
  startDay?: number;
  endAt?: number | string | bigint | { toString(): string };
  active?: boolean;
}

export function ProjectCard({ project }: { project: Project }) {
  console.log("Project Card ", project);

  // Helpers to safely convert on-chain values (BigInt or BigNumber) to JS numbers for UI
  const toWeiString = (v: any): string => {
    if (v === undefined || v === null) return "0";
    if (typeof v === "bigint") return v.toString();
    if (typeof v === "number") return v.toString();
    if (typeof v === "string") return v;
    if (typeof v === "object" && typeof v.toString === "function")
      return v.toString();
    return String(v);
  };

  const formatWeiToFloat = (v: any): number => {
    const s = toWeiString(v);
    if (!s || s === "0") return 0;
    // s is an integer string representing wei. Convert to ether as a float without external libs.
    const negative = s[0] === "-";
    const abs = negative ? s.slice(1) : s;
    // remove leading zeros
    const cleaned = abs.replace(/^0+/, "") || "0";
    if (cleaned === "0") return 0;
    if (cleaned.length <= 18) {
      const n = Number(cleaned);
      return ((negative ? -1 : 1) * n) / 1e18;
    }
    const intPart = cleaned.slice(0, cleaned.length - 18);
    let fracPart = cleaned.slice(cleaned.length - 18);
    // trim trailing zeros in fractional part for cleaner parse
    fracPart = fracPart.replace(/0+$/, "");
    const str = fracPart ? `${intPart}.${fracPart}` : intPart;
    const num = Number(str);
    return negative ? -num : num;
  };

  const goalNum = formatWeiToFloat(project.goal);
  const pledgedNum = formatWeiToFloat(project.pledged);
  const progress = goalNum === 0 ? 0 : (pledgedNum / goalNum) * 100;
  const Icon = categoryIcons[project.category as keyof typeof categoryIcons];

  const endSeconds = Number(project.endAt); // e.g. 1763942400
  const nowSeconds = Math.floor(Date.now() / 1000);

  const secondsLeft = endSeconds - nowSeconds;
  const daysLeft = Math.max(Math.ceil(secondsLeft / 86400), 0); // 86400 sec = 1 day

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div className="flex justify-between items-center mb-2">
          <CardTitle>{project.title}</CardTitle>
          <Icon
            className={`w-5 h-5 ${
              categoryColors[project.category as keyof typeof categoryColors]
            }`}
          />
        </div>
        <div
          className={`text-sm ${
            categoryColors[project.category as keyof typeof categoryColors]
          }`}
        >
          {project.category}
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground mb-4">
          {project.description}
        </p>
        <Progress value={progress} className="mb-2" />
        <div className="flex justify-between text-sm">
          <span>
            $
            {pledgedNum.toLocaleString(undefined, { maximumFractionDigits: 4 })}{" "}
            raised
          </span>
          <span>
            ${goalNum.toLocaleString(undefined, { maximumFractionDigits: 4 })}{" "}
            goal
          </span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">
          {project.endAt ? daysLeft : 0} days left
        </span>
        <Button asChild>
          <Link href={`/projects/${project.id}`}>Support This Project</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
