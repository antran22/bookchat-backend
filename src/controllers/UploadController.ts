import {
  Post,
  Request,
  Route,
  Security,
  Tags,
  UploadedFiles,
} from "@tsoa/runtime";
import express from "express";
import { multipleMulterFilesToStaticUrls } from "@/utils";

export interface UploadResult {
  fileUrls: string[];
}

@Tags("Upload")
@Route("uploads")
export class UploadController {
  /**
   * Upload some files to the server and get the url back.
   */
  @Security("jwt")
  @Post("/")
  public async uploadFiles(
    @Request() request: express.Request,
    @UploadedFiles() images: Express.Multer.File[]
  ): Promise<UploadResult> {
    const fileUrls = await multipleMulterFilesToStaticUrls();
    return {
      fileUrls,
    };
  }
}
