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
@Route("upload")
export class UploadController {
  /**
   * Create a book
   */
  @Security("jwt")
  @Post("/")
  public async createBook(
    @Request() request: express.Request,
    @UploadedFiles() images: Express.Multer.File[]
  ): Promise<UploadResult> {
    const fileUrls = await multipleMulterFilesToStaticUrls();
    return {
      fileUrls,
    };
  }
}
