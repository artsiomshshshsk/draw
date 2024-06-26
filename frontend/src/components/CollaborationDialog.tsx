import {Button} from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {Input} from '@/components/ui/input.tsx';
import {Label} from '@/components/ui/label.tsx';
import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';

enum Step {
    START,
    SHARE
}

interface CollaborationDialogProps {
    onCreateRoom: () => Promise<string>;
    onRemoveRoom: () => void;
    username: string;
    onUsernameChange: (username: string) => void;
    existingRoom: string | undefined;
}

export function CollaborationDialog({
                                        onCreateRoom,
                                        onRemoveRoom,
                                        onUsernameChange,
                                        username,
                                        existingRoom
                                    }: CollaborationDialogProps) {


    const [room, setRoom] = useState<string | undefined>(undefined);
    const [step, setStep] = useState<Step>(Step.START);
    const navigate = useNavigate();

    useEffect(() => {
        if(existingRoom) {
            setStep(Step.SHARE);
            setRoom(existingRoom);
        }
    }, [existingRoom]);

    const handleStartSession = async () => {
        try {
            const roomId = await onCreateRoom();
            console.log('Room created: ', roomId);
            setRoom(roomId);
            setStep(Step.SHARE);
            navigate(`/room/${roomId}`);
        } catch (error) {
            console.error('Error creating room:', error);
        }
    };

    const handleStopSession = () => {
        setStep(Step.START);
        onRemoveRoom();
    };

    const handleUsernameChange = (event: any) => {
        onUsernameChange(event.target.value)
    }

    const activeButtonClass = 'bg-green-200 hover:bg-green-100'

    const baseURL = window.location.origin;
    const roomURL = `${baseURL}/room/${room}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(roomURL)
            .then(() => {
                console.log('URL copied to clipboard!');
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
            });
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" className={existingRoom ? activeButtonClass : ''}>Share</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                {step === Step.START && <>
                    <DialogHeader>
                        <DialogTitle>Live Collaboration</DialogTitle>
                        <DialogDescription>
                            Invite people to collaborate on your drawing.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button type="submit" onClick={handleStartSession}>Start Session</Button>
                    </DialogFooter>
                </>}
                {
                    step === Step.SHARE && <>
                        <DialogHeader>
                            <DialogTitle>Live Collaboration</DialogTitle>
                            <DialogDescription>
                                Share this link with others to collaborate.
                            </DialogDescription>
                            <div className="items-center gap-4 mt-1.5">
                                <Label htmlFor="name" className="text-right">
                                    Your name
                                </Label>
                                <Input
                                    disabled={true}
                                    id="name"
                                    onChange={handleUsernameChange}
                                    className={'mt-1.5'}
                                    defaultValue={username}
                                />
                            </div>

                            <div className="items-center gap-4">
                                <Label htmlFor="link" className="text-right">
                                    Link
                                </Label>
                                <div className={`flex items-center gap-2 mt-1.5`}>
                                    <Input
                                        id="link"
                                        defaultValue={roomURL}
                                        readOnly
                                    />
                                    <Button onClick={handleCopy}>Copy</Button>
                                </div>
                            </div>
                            <div className={'mt-16'}>
                                <Button onClick={handleStopSession}>Stop</Button>
                            </div>
                        </DialogHeader>
                    </>
                }
            </DialogContent>
        </Dialog>
    );
}