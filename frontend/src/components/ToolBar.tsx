import React from 'react';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { FaSquare,  FaMinus, } from 'react-icons/fa';
import {DrawElementType} from "@/domain.ts";

interface ToolbarProps {
    tool: DrawElementType;
    setTool: (tool: DrawElementType) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({tool, setTool}) => {

    const handleToolChange = (tool: DrawElementType) => {
        setTool(tool);
    }

    return (
        <ToggleGroup type="single" value={tool} aria-label="Drawing-tools" onValueChange={handleToolChange}>
            <ToggleGroupItem value="RECTANGLE" aria-label="Rectangle">
                <FaSquare />
            </ToggleGroupItem>
            <ToggleGroupItem value="LINE" aria-label="Line">
                <FaMinus />
            </ToggleGroupItem>
        </ToggleGroup>
    );
};

export default Toolbar;
