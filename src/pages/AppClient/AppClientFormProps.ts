import { AppClientFlat } from "../../state/app-clients/interface/app-client-flat";
import { AppClientFormActionSuccess } from "./AppClientFormActionSuccess";
import { AppClientFormActionType } from "./AppClientFormActionType";
import { AppClientFormError } from "./AppClientFormError";

export interface AppClientFormProps {
  client?: AppClientFlat;
  errors?: AppClientFormError;
  onSubmit: (event: React.FormEvent<HTMLFormElement>, client: AppClientFlat) => void;
  onCancel: (event: React.FormEvent<HTMLFormElement>) => void;
  type: AppClientFormActionType;
  isSubmitting: boolean;
  successAction: AppClientFormActionSuccess;
}
