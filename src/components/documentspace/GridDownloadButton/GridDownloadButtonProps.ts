import {DocumentDto} from "../../../openapi";

export interface GridDownloadButtonProps {
  link: string;
  doc?: DocumentDto
  title?: string;
  hasContents?: boolean
}