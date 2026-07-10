import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const browserlessApiToken = Deno.env.get("BROWSERLESS_API_TOKEN");

if (!supabaseUrl || !supabaseKey || !browserlessApiToken) {
  const error = "Missing environment variables";
  throw new Error(error);
}

const supabaseClient = createClient(supabaseUrl, supabaseKey);

async function generatePetPosterPDF(posterId: string): Promise<Uint8Array> {
  const TOKEN = browserlessApiToken;
  const url = `https://production-sfo.browserless.io/pdf?token=${TOKEN}`;
  const headers = {
    "Cache-Control": "no-cache",
    "Content-Type": "application/json",
  };

  const data = {
    url: `https://spotapaw.com/og/posters/${posterId}`,
    options: {
      displayHeaderFooter: true,
      printBackground: false,
      format: "A0",
    },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to generate PDF: ${response.statusText}`);
  }

  const pdfBuffer = await response.arrayBuffer();
  return new Uint8Array(pdfBuffer);
}

async function generatePosterPNG(posterId: string): Promise<Uint8Array> {
  const TOKEN = browserlessApiToken;
  const url = `https://production-sfo.browserless.io/screenshot?token=${TOKEN}`;
  const headers = {
    "Cache-Control": "no-cache",
    "Content-Type": "application/json",
  };

  const data = {
    url: `https://spotapaw.com/og/posters/${posterId}`,
    options: {
      fullPage: true,
      type: "png",
    },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to generate PNG: ${response.statusText}`);
  }

  const buffer = await response.arrayBuffer();
  return new Uint8Array(buffer);
}

async function uploadPosterBytes(pdfData: Uint8Array, filename: string) {
  const { error } = await supabaseClient.storage
    .from("pet_posters")
    .upload(filename, pdfData, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (error) {
    throw new Error(`Failed to upload poster bytes: ${error.message}`);
  }
}

async function saveURLsToPoster(
  posterId: string,
  pdfUrl: string,
  pngUrl: string,
) {
  const { error } = await supabaseClient
    .from("posters")
    .update({
      pdf_url: pdfUrl,
      png_url: pngUrl,
    })
    .eq("id", posterId);

  if (error) {
    throw new Error(`Failed to save URLs to poster: ${error.message}`);
  }
}

Deno.serve(async (req: Request) => {
  const { record } = await req.json();
  let pdfPublicUrl = null;
  let pngPublicUrl = null;

  if (!record) {
    return new Response("Missing record in request body", { status: 400 });
  }

  try {
    const pdfData = await generatePetPosterPDF(record.id);
    const pdfFilePath = `${record.sighting_id}.pdf`;
    await uploadPosterBytes(pdfData, pdfFilePath);

    const {
      data: { publicUrl: pdfPublicUrlResult },
      error: pdfPublicUrlError,
    } = supabaseClient.storage.from("pet_posters").getPublicUrl(pdfFilePath);

    if (pdfPublicUrlError) {
      console.error("Failed to get PDF public URL:", pdfPublicUrlError.message);
      return new Response("Failed to get PDF public URL", { status: 500 });
    }

    pdfPublicUrl = pdfPublicUrlResult;
  } catch (error) {
    console.error("Failed to generate PDF:", error);
    return new Response("Failed to generate PDF", { status: 500 });
  }

  try {
    const pngData = await generatePosterPNG(record.id);
    const pngFilePath = `${record.sighting_id}.png`;
    await uploadPosterBytes(pngData, pngFilePath);

    const {
      data: { publicUrl: pngPublicUrlResult },
      error: pngPublicUrlError,
    } = supabaseClient.storage.from("pet_posters").getPublicUrl(pngFilePath);

    if (pngPublicUrlError) {
      console.error("Failed to get PNG public URL:", pngPublicUrlError.message);
      return new Response("Failed to get PNG public URL", { status: 500 });
    }

    pngPublicUrl = pngPublicUrlResult;
  } catch (error) {
    console.error("Failed to generate PNG:", error);
    return new Response("Failed to generate PNG", { status: 500 });
  }

  try {
    await saveURLsToPoster(record.id, pdfPublicUrl, pngPublicUrl);
  } catch (error) {
    console.error("Failed to save URLs to poster:", error);
    return new Response("Failed to save URLs to poster", { status: 500 });
  }
});
