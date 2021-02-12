import { AppClientFlat } from "../../state/app-clients/interface/app-client-flat";
import { AppClientFormActionType } from "./AppClientFormActionType";
import { AppClientFormError } from "./AppClientFormError";

export interface AppClientFormProps {
  client?: AppClientFlat;
  errors?: AppClientFormError;
  onSubmit: (event: React.FormEvent<HTMLFormElement>, client: AppClientFlat) => void;
  type: AppClientFormActionType;
  isSubmitting: boolean;
}