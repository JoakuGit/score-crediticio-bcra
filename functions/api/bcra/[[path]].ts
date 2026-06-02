const BCRA_BASE_URL = 'https://api.bcra.gob.ar/centraldedeudores/v1.0';

function buildTargetUrl(pathSegments: string[] | undefined, search: string) {
  const safeSegments = (pathSegments ?? []).filter(Boolean).map((segment) => encodeURIComponent(segment));
  const path = safeSegments.join('/');
  return `${BCRA_BASE_URL}/${path}${search}`;
}

export const onRequestGet: PagesFunction = async (context) => {
  const pathSegments = context.params.path;
  const search = new URL(context.request.url).search;
  const targetUrl = buildTargetUrl(Array.isArray(pathSegments) ? pathSegments : pathSegments ? [pathSegments] : [], search);

  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Cache-Control': 'no-cache',
      },
    });

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        'Content-Type': response.headers.get('Content-Type') ?? 'application/json',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo conectar con el BCRA.';

    return Response.json(
      {
        status: 502,
        errorMessages: [message],
      },
      { status: 502 },
    );
  }
};
