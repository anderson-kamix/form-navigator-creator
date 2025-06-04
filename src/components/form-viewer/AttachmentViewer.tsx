
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Eye, FileText, Image } from 'lucide-react';
import { processAttachmentUrl } from './utils/storageUtils';

interface AttachmentViewerProps {
  attachments: Record<string, string>;
  questionId: string;
  questionTitle: string;
  showDownload?: boolean;
}

const AttachmentViewer: React.FC<AttachmentViewerProps> = ({
  attachments,
  questionId,
  questionTitle,
  showDownload = true
}) => {
  const attachmentData = attachments[questionId];
  
  if (!attachmentData) {
    return null;
  }

  const fileUrl = processAttachmentUrl(attachmentData);
  const isImage = fileUrl.includes('image/') || fileUrl.includes('.jpg') || fileUrl.includes('.png') || fileUrl.includes('.jpeg') || fileUrl.includes('.gif');

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = `anexo_${questionTitle.replace(/\s+/g, '_')}.${isImage ? 'jpg' : 'file'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleView = () => {
    window.open(fileUrl, '_blank');
  };

  return (
    <Card className="p-3 bg-slate-50 border-slate-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {isImage ? (
            <div className="flex items-center space-x-3">
              <Image className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-slate-700">Imagem anexada</p>
                <div className="mt-2">
                  <img 
                    src={fileUrl} 
                    alt="Anexo" 
                    className="max-w-xs max-h-32 rounded-md border object-cover"
                    onError={(e) => {
                      console.error('Error loading image:', e);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <FileText className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-slate-700">Arquivo anexado</p>
                <p className="text-xs text-slate-500">Clique para visualizar</p>
              </div>
            </div>
          )}
        </div>
        
        {showDownload && (
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleView}
              className="flex items-center space-x-1"
            >
              <Eye className="w-4 h-4" />
              <span>Ver</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="flex items-center space-x-1"
            >
              <Download className="w-4 h-4" />
              <span>Baixar</span>
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default AttachmentViewer;
