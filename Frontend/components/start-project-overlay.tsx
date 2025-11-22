"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { parseEther } from "viem";
import { abi } from "../lib/abi";

import { useWriteContract } from "wagmi";
import { useAppKitAccount } from "@reown/appkit/react";
import confetti from "canvas-confetti";

interface StartProjectOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const categories = [
  "Education",
  "Community",
  "Technology",
  "Environment",
  "Arts & Culture",
  "Wellness",
];

export function StartProjectOverlay({
  isOpen,
  onClose,
}: StartProjectOverlayProps) {
  const { writeContract } = useWriteContract();
  const { isConnected } = useAppKitAccount();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleSubmit = async () => {
    // Here you would handle the actual project submission
    console.log("Project submitted:", {
      title,
      description,
      amount,
      category,
      startDate,
      endDate,
    });

    const LAUNCH_MAX_DURATION = 90 * 24 * 60 * 60; // 90 days in seconds
    const goalWei = parseEther(amount);

    // Convert datetime-local strings -> seconds since epoch
    const startSeconds = Math.floor(new Date(startDate).getTime() / 1000);
    const endSeconds = Math.floor(new Date(endDate).getTime() / 1000);

    const nowSeconds = Math.floor(Date.now() / 1000);

    // Basic validation (mirror contract checks)
    if (startSeconds < nowSeconds) {
      throw new Error("Start date must be >= now");
    }
    if (endSeconds < startSeconds) {
      throw new Error("End date must be >= start date");
    }
    if (endSeconds > nowSeconds + LAUNCH_MAX_DURATION) {
      throw new Error("End date exceeds max duration (90 days)");
    }

    // Ensure values fit uint32 (optional but safe)
    const MAX_UINT32 = 2 ** 32 - 1;
    if (startSeconds > MAX_UINT32 || endSeconds > MAX_UINT32) {
      throw new Error("Date value out of uint32 range");
    }

    // Convert goal (amount) from ETH to wei. Adjust if your UI uses different units.

    console.log("Converted Project Data:", {
      title,
      description,
      goalWei,
      category,
      startSeconds,
      endSeconds,
    });

    if (!isConnected) {
      alert("Please connect your wallet to create a project.");
      return;
    }

    writeContract({
      abi,
      address: "0x2CF2729f7fd4D786Be805cd19376A7bFa1c845fd",
      functionName: "launch",
      args: [title, description, category, goalWei, startSeconds, endSeconds],
    });

    // Trigger confetti effect
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    // Reset form and close overlay
    setTitle("");
    setDescription("");
    setAmount("");
    setCategory("");
    setStartDate("");
    setEndDate("");
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Start a New Project</DialogTitle>
            <DialogDescription>
              Fill in the details below to create your new crowdfunding project.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Project Title</Label>
              <Input
                id="title"
                placeholder="Enter project title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Project Description</Label>
              <Textarea
                id="description"
                placeholder="Enter project description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Funding Goal</Label>
              <Input
                id="amount"
                placeholder="Enter funding goal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                type="number"
                min="1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select onValueChange={setCategory} value={category}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            <Button
              onClick={handleSubmit}
              className="w-full"
              disabled={
                !title ||
                !description ||
                !amount ||
                !category ||
                !startDate ||
                !endDate
              }
            >
              Create Project
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
