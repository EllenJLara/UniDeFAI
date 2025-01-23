import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import SignInOptions from "../elements/login-popup";
import { AUTH_DIALOG_ACTION } from "./aut-dialog.types";

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  dialogActionText: string;
  onlyWallet?: boolean;
}

const AuthDialog = ({
  isOpen,
  onClose,
  dialogActionText = AUTH_DIALOG_ACTION.POST,
  onlyWallet = false,
}: AuthDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[90%] p-6 bg-black rounded-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold mb-4 text-center">
            {dialogActionText}
          </DialogTitle>
          <SignInOptions onlyWallet={onlyWallet} />
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;
