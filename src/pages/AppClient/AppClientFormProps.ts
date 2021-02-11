import { AppClientFlat } from "../../state/app-clients/interface/app-client-flat";

export interface AppClientFormProps {
  client?: AppClientFlat;
  errors?: {
    name?: string
  };
  onSubmit: (event: React.FormEvent<HTMLFormElement>, client: AppClientFlat) => void;
}