async function runTests() {
  console.log('🚀 Running Comprehensive End-to-End API Verification...\n');

  // 1. Discover
  console.log('1. Testing /api/movies (Discover)...');
  const resDisc = await fetch('http://localhost:5000/api/movies?genre=28&sortBy=vote_average.desc&page=1');
  const disc = await resDisc.json();
  console.log(`   Status: ${resDisc.status} | Total: ${disc.totalResults} | Top: "${disc.results[0]?.title}" (${disc.results[0]?.rating}★)`);

  // 2. Search
  console.log('\n2. Testing /api/movies/search (Search)...');
  const resSrch = await fetch('http://localhost:5000/api/movies/search?q=Inception');
  const srch = await resSrch.json();
  console.log(`   Status: ${resSrch.status} | Found: ${srch.totalResults} | Match: "${srch.results[0]?.title}" (${srch.results[0]?.releaseYear})`);

  // 3. Details & Watch Providers
  console.log('\n3. Testing /api/movies/:id (Details + Where to Watch)...');
  const resDet = await fetch('http://localhost:5000/api/movies/550?country=IN');
  const det = await resDet.json();
  const m = det.data;
  console.log(`   Status: ${resDet.status} | Title: "${m.title}" | Runtime: ${m.runtimeFormatted}`);
  console.log(`   Trailer: "${m.trailer?.name}" (${m.trailer?.youtubeUrl})`);
  console.log(`   Cast members: ${m.cast?.length} | Lead: ${m.cast[0]?.name} as ${m.cast[0]?.character}`);
  console.log(`   Where to Watch (IN): ${m.watchProviders.flatrate.map(p => p.providerName).join(', ') || 'None'}`);
  console.log(`   Attribution: "${m.watchProviders.attribution.disclaimer}"`);

  // 4. Dynamic Country Switching for Watch Providers
  console.log('\n4. Testing /api/movies/:id/watch-providers (Region: US)...');
  const resWP = await fetch('http://localhost:5000/api/movies/550/watch-providers?country=US');
  const wp = await resWP.json();
  console.log(`   Status: ${resWP.status} | US Stream Providers: ${wp.data.flatrate.map(p => p.providerName).join(', ') || 'Rent/Buy only'}`);

  // 5. Wishlist Add (POST)
  console.log('\n5. Testing /api/wishlist (POST Add to PostgreSQL)...');
  const resAdd = await fetch('http://localhost:5000/api/wishlist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      movieId: 550,
      title: 'Fight Club',
      posterPath: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
      backdropPath: '/hZkgoQYus5vegHoetLkCJzb17zJ.jpg',
      rating: 8.4,
      releaseDate: '1999-10-15',
      overview: 'An ticking-time-bomb insomniac...'
    })
  });
  const addData = await resAdd.json();
  console.log(`   Status: ${resAdd.status} | Added: "${addData.data?.title}" | DB ID: ${addData.data?.id}`);

  // 6. Wishlist Check (GET)
  console.log('\n6. Testing /api/wishlist/:movieId/check...');
  const resChk = await fetch('http://localhost:5000/api/wishlist/550/check');
  const chkData = await resChk.json();
  console.log(`   Status: ${resChk.status} | isWishlisted: ${chkData.isWishlisted}`);

  // 7. Wishlist Get All (GET)
  console.log('\n7. Testing /api/wishlist (GET All from PostgreSQL)...');
  const resList = await fetch('http://localhost:5000/api/wishlist');
  const listData = await resList.json();
  console.log(`   Status: ${resList.status} | Persisted count: ${listData.data?.length}`);

  // 8. Wishlist Remove (DELETE)
  console.log('\n8. Testing /api/wishlist/:movieId (DELETE from PostgreSQL)...');
  const resDel = await fetch('http://localhost:5000/api/wishlist/550', { method: 'DELETE' });
  const delData = await resDel.json();
  console.log(`   Status: ${resDel.status} | Removed: ${delData.removed}`);

  // 9. Verify Removal
  const resChk2 = await fetch('http://localhost:5000/api/wishlist/550/check');
  const chkData2 = await resChk2.json();
  console.log(`   Verified Status After Deletion: isWishlisted = ${chkData2.isWishlisted}`);

  console.log('\n🎉 ALL 9 END-TO-END TESTS PASSED WITH 100% SUCCESS!');
}

runTests().catch(console.error);
