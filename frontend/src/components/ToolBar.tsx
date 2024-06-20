import React from 'react';
import {ToggleGroup, ToggleGroupItem} from "@/components/ui/toggle-group"
import {FaSquare, FaMinus, FaCircle, FaArrowPointer, FaHand} from 'react-icons/fa6';
import {PiTextTBold} from "react-icons/pi";
import {DrawElementType, ToolType} from "@/domain.ts";
import {CollaborationDialog} from "@/components/CollaborationDialog.tsx";
import {Button} from "@/components/ui/button.tsx";

interface ToolbarProps {
    tool: ToolType;
    setTool: (tool: DrawElementType) => void;
    onCreateRoom: () => Promise<string>;
    onRemoveRoom: () => void;
    username: string;
    onUsernameChange: (username: string) => void;
    existingRoom: string | undefined;
    onClear: () => void;
    isCollaborating: boolean
}

const Toolbar: React.FC<ToolbarProps> = (
    {
        tool,
        setTool,
        onCreateRoom,
        onRemoveRoom,
        onUsernameChange,
        username,
        existingRoom,
        onClear,
        isCollaborating
    }
) => {

    const handleToolChange = (tool: DrawElementType) => {
        setTool(tool);
    }

    return (
        <div className={'fixed inset-x-0 top-0 z-10 p-2 m-2 flex justify-between items-center'}>
            <ToggleGroup type="single" value={tool}
                         aria-label="Drawing-tools" onValueChange={handleToolChange}>
                <ToggleGroupItem value="PAN" aria-label="Pan">
                    <FaHand/>
                </ToggleGroupItem>
                <ToggleGroupItem value="TRANSFORM" aria-label="Transform">
                    <FaArrowPointer/>
                </ToggleGroupItem>
                <ToggleGroupItem value="RECTANGLE" aria-label="Rectangle">
                    <FaSquare/>
                </ToggleGroupItem>
                <ToggleGroupItem value="LINE" aria-label="Line">
                    <FaMinus/>
                </ToggleGroupItem>
                <ToggleGroupItem value="CIRCLE" aria-label="Circle">
                    <FaCircle/>
                </ToggleGroupItem>
                <ToggleGroupItem value="TEXT" aria-label="Text">
                    <PiTextTBold/>
                </ToggleGroupItem>
                {!isCollaborating && <Button variant={'ghost'} onClick={onClear}>Clear</Button>}
            </ToggleGroup>
            <CollaborationDialog
                onCreateRoom={onCreateRoom}
                onRemoveRoom={onRemoveRoom}
                onUsernameChange={onUsernameChange}
                username={username}
                existingRoom={existingRoom}
            />
        </div>
    );
};

export default Toolbar;
