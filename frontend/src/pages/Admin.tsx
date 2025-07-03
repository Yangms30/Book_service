
import { useState, useEffect } from 'react';
import axios from 'axios';
import { User, CheckCircle, XCircle, Eye, MessageSquare } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import AdminAuthModal from '@/components/AdminAuthModal';

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(true);
  const [selectedAuthor, setSelectedAuthor] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      axios.get(`${import.meta.env.VITE_API_BASE_URL}/authors`)
        .then(res => {
          const mapped = res.data.map((app: any) => ({
            ...app,
            status: statusToKo(app.registrationStatus), // 💡 여기서 변환
          }));
          setApplications(mapped);
        })
        .catch(err => console.error('작가 리스트 불러오기 실패:', err));
    }
  }, [isAuthenticated]);

  const statusToKo = (status: string) => {
    switch (status) {
      case 'PENDING':
        return '대기중';
      case 'APPROVED':
        return '승인됨';
      case 'REJECTED':
        return '거절됨';
      default:
        return '알수없음'; 
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_BASE_URL}/authors/${id}/approveauthorregistration`);
      setApplications((prev) =>
        prev.map((app) => (app.authorId === id ? { ...app, status: "승인됨" } : app))
      );
    } catch (error) {
      console.error('승인 처리 중 오류:', error);
    }
  };

  const handleReject = async (id: number) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_BASE_URL}/authors/${id}/rejectauthorregistration`);
      setApplications((prev) =>
        prev.map((app) => (app.authorId === id ? { ...app, status: "거절됨" } : app))
      );
    } catch (error) {
      console.error('거절 처리 중 오류:', error);
    }
  };

  const handleViewDetails = (author: any) => {
    setSelectedAuthor(author);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      "대기중": { color: "bg-orange-100 text-orange-800", label: "대기중" },
      "승인됨": { color: "bg-green-100 text-green-800", label: "승인됨" },
      "거절됨": { color: "bg-red-100 text-red-800", label: "거절" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span className={`inline-block px-3 py-1 text-sm rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const pendingCount = applications.filter(app => app.status === "대기중").length;

  if (!isAuthenticated) {
    return (
      <>
        <Header />
        <AdminAuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)}
          onAuthenticate={() => {
            setIsAuthenticated(true);
            setShowAuthModal(false);
          }}
        />
        <div className="min-h-screen bg-gray-50 pt-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl font-light text-gray-900 mb-4">관리자 인증이 필요합니다</h1>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-light text-gray-900 mb-4">
              작가 등록 승인 관리
            </h1>
            <p className="text-lg text-gray-600">
              작가 등록 신청한 사용자들의 정보를 검토하고 승인 처리를 할 수 있습니다
            </p>
          </div>
          
          {/* Stats */}
          <div className="bg-warm-brown-50 border border-warm-brown-200 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium text-warm-brown-900 mb-2">승인 대기 중</h2>
                <p className="text-warm-brown-700">
                  현재 <span className="font-bold text-xl">{pendingCount}</span>명의 작가가 승인을 기다리고 있습니다.
                </p>
              </div>
              <div className="text-4xl text-warm-brown-600">📋</div>
            </div>
          </div>
          
          {/* Applications List */}
          <div className="space-y-6">
            {applications.map((application) => (
              <div key={application.id} className="bg-white rounded-lg border border-warm-brown-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-warm-brown-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-warm-brown-700" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{application.name}</h3>
                        <p className="text-sm text-gray-600">신청일: {new Intl.DateTimeFormat('ko-KR').format(new Date(application.appliedDate))}</p>
                      </div>
                    </div>
                    {getStatusBadge(application.status)}
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{application.email}</span>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <p className="text-gray-700 leading-relaxed">
                      {application.bio}
                    </p>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(application)}
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-900 border-warm-brown-300"
                    >
                      <Eye className="w-4 h-4" />
                      상세보기
                    </Button>
                    
                    {application.status === "대기중" && (
                      <>
                        <Button
                          onClick={() => handleApprove(application.authorId)}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          승인
                        </Button>
                        <Button
                          onClick={() => handleReject(application.authorId)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-200 hover:bg-red-50 flex items-center gap-2"
                        >
                          <XCircle className="w-4 h-4" />
                          거절
                        </Button>
                      </>
                    )}
                    
                    {application.status === "승인됨" && (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">승인 완료</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      
      {/* Author Details Modal */}
      {selectedAuthor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">작가 상세 정보</h2>
                <button
                  onClick={() => setSelectedAuthor(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-warm-brown-100 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-warm-brown-700" />
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-gray-900">{selectedAuthor.name}</h3>
                    <p className="text-gray-600">{selectedAuthor.email}</p>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">신청일</h4>
                    <p className="text-gray-600">{new Intl.DateTimeFormat('ko-KR').format(new Date(selectedAuthor.appliedDate))}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">자기소개</h4>
                  <p className="text-gray-600 leading-relaxed">{selectedAuthor.bio}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">포트폴리오</h4>
                  <a 
                    href={selectedAuthor.portfolio} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-warm-brown-600 hover:text-warm-brown-700 underline"
                  >
                    {selectedAuthor.portfolio}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
};

export default Admin;
