import { createServerFn } from "@tanstack/react-start";
import QRCode from "qrcode";
import z from "zod";
import { ticketIdSchema } from "./validations";

export const generateQRCode = createServerFn()
  .inputValidator(
    z.object({
      ticketId: ticketIdSchema,
    })
  )
  .handler(
    async ({
      data: { ticketId },
    }): Promise<{ qrCode: string; ticketUrl: string }> => {
      try {
        const baseUrl = process.env.AUTH0_BASE_URL || "http://localhost:3000";
        const ticketUrl = `${baseUrl}/ticket/${ticketId}`;

        const qrCodeDataURL = await QRCode.toDataURL(ticketUrl, {
          errorCorrectionLevel: "M",
          type: "image/png",
          margin: 1,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        });

        return { qrCode: qrCodeDataURL, ticketUrl };
      } catch (error) {
        console.error("Error generating QR code:", error);
        throw new Error("Failed to generate QR code");
      }
    }
  );
