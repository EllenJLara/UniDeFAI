    import React from "react";
    import { Camera, Bot, Sparkles, Laptop } from "lucide-react";
    import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    } from "@/components/ui/select";

    interface CreateAgentProps {
    onSuccess?: () => void;
    }

    const CreateAgent: React.FC<CreateAgentProps> = ({ onSuccess }) => {
    return (
        <div className="flex flex-col space-y-6 p-6">
        {/* Profile Picture Upload */}
        <div className="flex justify-center">
            <button className="relative w-20 h-20 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors flex items-center justify-center group">
            <Camera className="w-8 h-8  group-hover:text-gray-300" />
            <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept="image/*"
            />
            </button>
        </div>

        {/* Agent Name Input */}
        <div className="space-y-2">
            <label className="text-sm  flex items-center">
            <Bot className="w-4 h-4 mr-1.5 inline" />
            AI agent name
            <span className="text-red-400 ml-1">*</span>
            </label>
            <input
            type="text"
            placeholder="Give your agent a name 🤖"
            className="text-sm w-full bg-gray-800 text-white placeholder-gray-500 p-3 focus:outline-none focus:ring-2 focus:ring-gray-600"
            required
            />
        </div>

        {/* Description Box */}
        <div className="space-y-2">
            <label className="text-sm  flex items-center">
            <Sparkles className="w-4 h-4 mr-1.5 inline" />
            AI Agent Description
            <span className="text-red-400 ml-1">*</span>
            </label>
            <textarea
            placeholder="Describe your agent's superpowers 🔋"
            className="text-sm w-full h-32 bg-gray-800 text-white placeholder-gray-500 p-3 resize-none focus:outline-none focus:ring-2 focus:ring-gray-600"
            required
            />
        </div>

        {/* Skill Selector */}
        <div className="space-y-2">
            <label className="text-sm  flex items-center">
            <Laptop className="w-4 h-4 mr-1.5 inline" />
            Choose a skill
            <span className="text-red-400 ml-1">*</span>
            </label>
            <Select>
            <SelectTrigger className="text-sm w-full bg-gray-800  border-gray-700 focus:ring-2 focus:ring-gray-600">
                <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="none">None ⚪️</SelectItem>
                <SelectItem value="productivity">Productivity 📈</SelectItem>
                <SelectItem value="entertainment">Entertainment 🎮</SelectItem>
                <SelectItem value="onchain">On-chain ⛓️</SelectItem>
                <SelectItem value="information">Information 📚</SelectItem>
                <SelectItem value="creative">Creative 🎨</SelectItem>
            </SelectContent>
            </Select>
        </div>

        {/* Create Button - Unchanged */}
        <button
            disabled
            className="rounded-lg w-full bg-purple-500 py-2 px-4 cursor-not-allowed opacity-50 flex items-center justify-center space-x-2 mt-auto hover:bg-purple-600 transition-colors"
        >
            <span className="font-sans font-bold">
            Create Agent ✨ (coming soon!)
            </span>
        </button>
        </div>
    );
    };

    export default CreateAgent;
