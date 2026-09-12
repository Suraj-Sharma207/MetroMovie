import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

/**
 * /discover → redirects to /search preserving all query params.
 *
 * This keeps all existing "See All →" links working.
 * The unified Search + Browse experience lives at /search.
 */
export default function DiscoverPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Preserve any existing filter params (genre, sort, rating, year, page)
    const params = searchParams.toString();
    navigate(`/search${params ? `?${params}` : ''}`, { replace: true });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
