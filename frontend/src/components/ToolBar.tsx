import { CollaborationDialog } from '@/components/CollaborationDialog.tsx';
import {ToggleGroup, ToggleGroupItem} from "@/components/ui/toggle-group"
import {FaSquare, FaMinus, FaCircle} from 'react-icons/fa';
import {FaArrowPointer} from 'react-icons/fa6';
import {DrawElementType} from "@/domain.ts";

interface ToolbarProps {
    tool: DrawElementType;
    setTool: (tool: DrawElementType) => void;
    onCreateRoom: () => void;
    onRemoveRoom: () => void;
}

const Toolbar: React.FC<ToolbarProps> = (
  {tool, setTool, onCreateRoom, onRemoveRoom}) => {

    const handleToolChange = (tool: DrawElementType) => {
        setTool(tool);
    }

    return (
      <div className="fixed inset-x-0 top-0 z-10 p-2 m-2 flex justify-between items-center">
        <ToggleGroup
          className="p-2 m-2"
          type="single"
          value={tool}
          aria-label="Drawing-tools"
          onValueChange={handleToolChange}
        >
          <ToggleGroupItem value="SELECT" aria-label="Select">
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
        </ToggleGroup>
        <CollaborationDialog onCreateRoom={onCreateRoom} onRemoveRoom={onRemoveRoom}/>
      </div>
    );
};

export default Toolbar;
