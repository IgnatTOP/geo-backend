import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { X, Download, ExternalLink, Loader2, FileText, FileImage, FileVideo } from 'lucide-react'

interface DocumentViewerProps {
  url: string
  title?: string
  onClose?: () => void
}

/**
 * Компонент для просмотра документов на сайте
 */
export default function DocumentViewer({ url, title = 'Документ', onClose }: DocumentViewerProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const getDocumentViewerUrl = (docUrl: string): string => {
    const lowerUrl = docUrl.toLowerCase()
    
    // PDF - используем встроенный просмотрщик
    if (lowerUrl.endsWith('.pdf')) {
      return docUrl
    }
    
    // Word документы - используем Google Docs Viewer
    if (lowerUrl.endsWith('.doc') || lowerUrl.endsWith('.docx')) {
      return `https://docs.google.com/viewer?url=${encodeURIComponent(docUrl)}&embedded=true`
    }
    
    // Текстовые файлы - загружаем и отображаем содержимое
    if (lowerUrl.endsWith('.txt') || lowerUrl.endsWith('.rtf')) {
      return docUrl
    }
    
    return docUrl
  }

  const getFileType = (docUrl: string): string => {
    const lowerUrl = docUrl.toLowerCase()
    if (lowerUrl.endsWith('.pdf')) return 'pdf'
    if (lowerUrl.endsWith('.doc') || lowerUrl.endsWith('.docx')) return 'word'
    if (lowerUrl.endsWith('.txt')) return 'text'
    if (lowerUrl.endsWith('.rtf')) return 'rtf'
    if (lowerUrl.endsWith('.jpg') || lowerUrl.endsWith('.jpeg') || lowerUrl.endsWith('.png') || lowerUrl.endsWith('.gif') || lowerUrl.endsWith('.webp')) return 'image'
    if (lowerUrl.endsWith('.mp4') || lowerUrl.endsWith('.webm') || lowerUrl.endsWith('.avi')) return 'video'
    return 'unknown'
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
      case 'word':
      case 'text':
      case 'rtf':
        return <FileText className="w-5 h-5" />
      case 'image':
        return <FileImage className="w-5 h-5" />
      case 'video':
        return <FileVideo className="w-5 h-5" />
      default:
        return <FileText className="w-5 h-5" />
    }
  }

  const fileType = getFileType(url)
  const viewerUrl = getDocumentViewerUrl(url)

  useEffect(() => {
    // Симуляция загрузки
    const timer = setTimeout(() => {
      setLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [url])

  const handleClose = () => {
    setIsOpen(false)
    if (onClose) onClose()
  }

  const handleIframeError = () => {
    setError('Не удалось загрузить документ')
    setLoading(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-6xl max-h-[90vh] w-full p-0">
        <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-4 border-b bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center text-white shadow-glow">
                {getFileIcon(fileType)}
              </div>
              <div>
                <DialogTitle className="text-base sm:text-lg break-words">{title}</DialogTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  {fileType === 'pdf' && 'PDF документ'}
                  {fileType === 'word' && 'Word документ'}
                  {fileType === 'text' && 'Текстовый файл'}
                  {fileType === 'rtf' && 'RTF документ'}
                  {fileType === 'image' && 'Изображение'}
                  {fileType === 'video' && 'Видео'}
                  {fileType === 'unknown' && 'Файл'}
                </p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <a href={url} target="_blank" rel="noopener noreferrer" download>
                <Button variant="outline" size="sm" className="hover:bg-primary/10">
                  <Download className="w-4 h-4 mr-2" />
                  Скачать
                </Button>
              </a>
              <a href={url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="hover:bg-primary/10">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Открыть
                </Button>
              </a>
              <Button variant="ghost" size="sm" onClick={handleClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-hidden relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
                <p className="text-sm text-muted-foreground">Загрузка документа...</p>
              </div>
            </div>
          )}
          {error && (
            <div className="p-6 h-[calc(90vh-120px)] flex items-center justify-center">
              <div className="text-center">
                <svg className="w-16 h-16 text-muted-foreground mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-muted-foreground mb-4">{error}</p>
                <a href={url} target="_blank" rel="noopener noreferrer" download>
                  <Button>
                    <Download className="w-4 h-4 mr-2" />
                    Скачать файл
                  </Button>
                </a>
              </div>
            </div>
          )}
          {!error && (
            <>
              {fileType === 'pdf' ? (
                <iframe
                  src={viewerUrl}
                  className="w-full h-[calc(90vh-120px)] border-0"
                  title={title}
                  onLoad={() => setLoading(false)}
                  onError={handleIframeError}
                />
              ) : fileType === 'word' ? (
                <iframe
                  src={viewerUrl}
                  className="w-full h-[calc(90vh-120px)] border-0"
                  title={title}
                  onLoad={() => setLoading(false)}
                  onError={handleIframeError}
                />
              ) : fileType === 'image' ? (
                <div className="p-6 h-[calc(90vh-120px)] overflow-auto flex items-center justify-center bg-muted/20">
                  <img
                    src={url}
                    alt={title}
                    className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                    onLoad={() => setLoading(false)}
                    onError={handleIframeError}
                  />
                </div>
              ) : fileType === 'video' ? (
                <div className="p-6 h-[calc(90vh-120px)] overflow-auto flex items-center justify-center bg-black">
                  <video
                    src={url}
                    controls
                    className="max-w-full max-h-full"
                    onLoadedData={() => setLoading(false)}
                    onError={handleIframeError}
                  >
                    Ваш браузер не поддерживает воспроизведение видео.
                  </video>
                </div>
              ) : fileType === 'text' || fileType === 'rtf' ? (
                <div className="p-6 h-[calc(90vh-120px)] overflow-auto">
                  <iframe
                    src={viewerUrl}
                    className="w-full h-full border-0"
                    title={title}
                    onLoad={() => setLoading(false)}
                    onError={handleIframeError}
                  />
                </div>
              ) : (
                <div className="p-6 h-[calc(90vh-120px)] overflow-auto text-center flex items-center justify-center">
                  <div>
                    <svg className="w-16 h-16 text-muted-foreground mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <p className="text-muted-foreground mb-4">
                      Просмотр этого типа файла не поддерживается
                    </p>
                    <a href={url} target="_blank" rel="noopener noreferrer" download>
                      <Button className="gradient-primary shadow-glow">
                        <Download className="w-4 h-4 mr-2" />
                        Скачать файл
                      </Button>
                    </a>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

