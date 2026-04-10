import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Plus, ImagePlus, Loader2, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function AddPostButton({ profileId, userEmail }) {
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef();
  const queryClient = useQueryClient();

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handlePost = async () => {
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await base44.entities.FeedPost.create({
      profile_id: profileId,
      user_email: userEmail,
      image_url: file_url,
      caption,
    });
    queryClient.invalidateQueries({ queryKey: ['feedposts', profileId] });
    toast.success('Foto publicada!');
    setOpen(false);
    setPreview(null);
    setFile(null);
    setCaption('');
    setUploading(false);
  };

  const reset = () => {
    setPreview(null);
    setFile(null);
    setCaption('');
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="outline" size="sm" className="gap-2">
        <Plus className="w-4 h-4" />
        Adicionar foto
      </Button>

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ImagePlus className="w-5 h-5 text-primary" />
              Nova foto no feed
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            {!preview ? (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl h-48 cursor-pointer hover:border-primary hover:bg-primary/5 transition-all">
                <ImagePlus className="w-10 h-10 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">Clique para escolher uma foto</span>
                <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
              </label>
            ) : (
              <div className="relative rounded-2xl overflow-hidden">
                <img src={preview} alt="preview" className="w-full max-h-72 object-cover" />
                <button
                  onClick={reset}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            <Textarea
              placeholder="Escreva uma legenda... (opcional)"
              value={caption}
              onChange={e => setCaption(e.target.value)}
              className="h-20 resize-none"
            />
            <Button onClick={handlePost} disabled={!file || uploading} className="w-full">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              {uploading ? 'Publicando...' : 'Publicar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}