import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RequestBody {
  tiktokUrl: string;
}

async function downloadWithTikwm(tiktokUrl: string): Promise<{ videoUrl: string; thumbnailUrl: string | null }> {
  const response = await fetch(
    `https://www.tikwm.com/api/?url=${encodeURIComponent(tiktokUrl)}&hd=1`
  );

  if (!response.ok) {
    throw new Error(`Tikwm API returned ${response.status}`);
  }

  const data = await response.json();

  if (data.code !== 0 || !data.data?.play) {
    throw new Error(`Tikwm API error: ${JSON.stringify(data)}`);
  }

  return {
    videoUrl: data.data.play,
    thumbnailUrl: data.data?.cover || null,
  };
}

async function downloadWithSnaptik(tiktokUrl: string): Promise<{ videoUrl: string; thumbnailUrl: string | null }> {
  const response = await fetch('https://snaptik.app/abc2.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `url=${encodeURIComponent(tiktokUrl)}`,
  });

  if (!response.ok) {
    throw new Error(`Snaptik API returned ${response.status}`);
  }

  const html = await response.text();

  const videoMatch = html.match(/download-link[^>]*href="([^"]+)"/);
  if (!videoMatch || !videoMatch[1]) {
    throw new Error('Could not extract video URL from Snaptik');
  }

  return {
    videoUrl: videoMatch[1],
    thumbnailUrl: null,
  };
}

async function downloadWithTiktokScraper(tiktokUrl: string): Promise<{ videoUrl: string; thumbnailUrl: string | null }> {
  const response = await fetch('https://tiktok-scraper7.p.rapidapi.com/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url: tiktokUrl, hd: 1 }),
  });

  if (!response.ok) {
    throw new Error(`TikTok Scraper API returned ${response.status}`);
  }

  const data = await response.json();

  if (!data.data?.play) {
    throw new Error('Could not extract video URL from TikTok Scraper');
  }

  return {
    videoUrl: data.data.play,
    thumbnailUrl: data.data?.cover || null,
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { tiktokUrl }: RequestBody = await req.json();

    if (!tiktokUrl || !tiktokUrl.includes('tiktok.com')) {
      return new Response(
        JSON.stringify({ error: 'Invalid TikTok URL' }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let videoInfo: { videoUrl: string; thumbnailUrl: string | null } | null = null;
    let lastError: Error | null = null;

    try {
      console.log('Trying Tikwm...');
      videoInfo = await downloadWithTikwm(tiktokUrl);
    } catch (error) {
      console.error('Tikwm failed:', error);
      lastError = error as Error;
    }

    if (!videoInfo) {
      try {
        console.log('Trying Snaptik...');
        videoInfo = await downloadWithSnaptik(tiktokUrl);
      } catch (error) {
        console.error('Snaptik failed:', error);
        lastError = error as Error;
      }
    }

    if (!videoInfo) {
      throw new Error(`All download methods failed. Last error: ${lastError?.message || 'Unknown error'}`);
    }

    console.log('Successfully extracted video URL:', videoInfo.videoUrl);

    const videoResponse = await fetch(videoInfo.videoUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://www.tiktok.com/',
      },
    });

    if (!videoResponse.ok) {
      throw new Error(`Failed to download video file: ${videoResponse.status} ${videoResponse.statusText}`);
    }

    const videoBlob = await videoResponse.blob();
    console.log('Downloaded video blob, size:', videoBlob.size);

    if (videoBlob.size < 1000) {
      throw new Error('Downloaded video is too small, likely invalid');
    }

    const fileName = `tiktok-${Date.now()}.mp4`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('videos')
      .upload(fileName, videoBlob, {
        contentType: 'video/mp4',
        cacheControl: '3600',
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error(`Storage upload failed: ${uploadError.message}`);
    }

    console.log('Uploaded successfully:', uploadData.path);

    const { data: { publicUrl } } = supabase.storage
      .from('videos')
      .getPublicUrl(uploadData.path);

    return new Response(
      JSON.stringify({
        success: true,
        videoUrl: publicUrl,
        thumbnailUrl: videoInfo.thumbnailUrl,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Failed to process TikTok video',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
