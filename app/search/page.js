import { Suspense } from 'react';
import SearchContent from './SearchContent'; // 1단계에서 수정한 컴포넌트를 가져옵니다.

// 로딩 중 표시할 간단한 컴포넌트
// SearchContent에서 useSearchParams를 읽을 때 Suspense가 활성화됩니다.
function SearchLoadingFallback() {
  // 실제 UI 디자인에 맞게 로딩 스켈레톤 등을 넣을 수 있습니다.
  return <div>Loading search parameters...</div>; 
}

// 이 파일은 서버 컴포넌트(기본값)입니다.
export default function SearchPage() {
  return (
    // SearchContent 컴포넌트를 Suspense로 감싸서 빌드 오류를 해결합니다.
    // 이렇게 하면 정적 쉘을 유지하고 CSR bailout을 피할 수 있습니다.
    <Suspense fallback={<SearchLoadingFallback />}>
      <SearchContent />
    </Suspense>
  );
}