import React, { useEffect, useMemo, useRef, useState } from "react";
import { Modal, Spinner } from "react-bootstrap";
import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();


const KNOWN_IMAGE = ["image/png","image/jpeg","image/jpg","image/webp","image/gif","image/svg+xml"];
const KNOWN_VIDEO = ["video/mp4","video/webm","video/ogg"];
const KNOWN_AUDIO = ["audio/mpeg","audio/mp3","audio/wav","audio/ogg","audio/webm"];
const KNOWN_TEXT  = ["text/plain","text/csv","application/json"];

function sameOrigin(a, b) {
  try {
    return new URL(a).origin === new URL(b).origin;
  } catch { return false; }
}

function extFromUrl(u) {
  try { return (new URL(u).pathname.split(".").pop() || "").toLowerCase(); }
  catch { return (u.split("?")[0].split(".").pop() || "").toLowerCase(); }
}

export default function UniversalFileViewerModal({
  show,
  onHide,
  fileUrl,        // absolute or relative URL
  apiOrigin,      // absolute origin of your API (e.g. https://uginternsapi.dbasesolutions.in)
  jwt,            // full token string from localStorage (may include Bearer)
  title = "View file"
}) {
  const [state, setState] = useState({
    loading: false,
    error: "",
    blobUrl: "",
    mime: "",
    textPreview: "",
    pdf: { pageNumber: 1, numPages: null }
  });

  const objectUrlRef = useRef(null);

  const wantAuth = useMemo(() => {
    if (!fileUrl || !apiOrigin) return false;
    return sameOrigin(fileUrl, apiOrigin);
  }, [fileUrl, apiOrigin]);

  // Fetch -> Blob each time fileUrl changes
  useEffect(() => {
    if (!show || !fileUrl) return;

    let aborted = false;
    const ac = new AbortController();

    const run = async () => {
      setState(s => ({ ...s, loading: true, error: "", blobUrl: "", mime: "", textPreview: "", pdf: { pageNumber: 1, numPages: null }}));
      try {
        const headers = new Headers();
        if (wantAuth && jwt) {
          headers.set("Authorization", jwt.startsWith("Bearer ") ? jwt : `Bearer ${jwt}`);
        }

        const res = await fetch(fileUrl, { headers, signal: ac.signal });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        // Content-Type could be missing; try to infer from extension if so
        let mime = res.headers.get("content-type") || "";
        const blob = await res.blob();

        if (!mime || mime === "application/octet-stream") {
          // Best-effort infer
          const ext = extFromUrl(fileUrl);
          if (["pdf"].includes(ext)) mime = "application/pdf";
          else if (["png","jpg","jpeg","gif","webp","svg"].includes(ext)) mime = `image/${ext === "jpg" ? "jpeg" : ext}`;
          else if (["mp4","webm","ogg"].includes(ext)) mime = `video/${ext}`;
          else if (["mp3","wav"].includes(ext)) mime = ext === "mp3" ? "audio/mpeg" : "audio/wav";
          else if (["txt","csv"].includes(ext)) mime = `text/${ext}`;
          else if (["json"].includes(ext)) mime = "application/json";
        }

        const objUrl = URL.createObjectURL(blob);
        objectUrlRef.current = objUrl;

        // For simple text types, decode to show pretty preview
        let textPreview = "";
        if (KNOWN_TEXT.some(t => mime.startsWith(t))) {
          try {
            textPreview = await blob.text();
          } catch {}
        }

        if (!aborted) {
          setState(s => ({ ...s, loading: false, mime, blobUrl: objUrl, textPreview }));
        }
      } catch (e) {
        if (!aborted) {
   const msg = (e && e.message) || String(e);
   const hint = msg.includes('HTTP 404')
     ? 'File not found (404). The path/case may be wrong (e.g., /Uploads vs /uploads).'
     : '';
   setState(s => ({ ...s, loading: false, error: [msg, hint].filter(Boolean).join(' ') }));
 }
      }
    };

    run();

    return () => {
      aborted = true;
      ac.abort();
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, [show, fileUrl, jwt, wantAuth]);

  const isPdf    = state.mime.startsWith("application/pdf");
  const isImage  = KNOWN_IMAGE.some(t => state.mime.startsWith(t));
  const isVideo  = KNOWN_VIDEO.some(t => state.mime.startsWith(t));
  const isAudio  = KNOWN_AUDIO.some(t => state.mime.startsWith(t));
  const isText   = KNOWN_TEXT .some(t => state.mime.startsWith(t));

  const close = () => {
    // Clean URL on close
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setState(s => ({ ...s, blobUrl: "", textPreview: "", pdf: { pageNumber: 1, numPages: null }}));
    onHide?.();
  };

  const DownloadButton = () => (
    <a
      href={state.blobUrl || fileUrl}
      download
      className="btn btn-sm btn-outline-secondary"
    >
      Download
    </a>
  );

  const OpenInNewTab = () => (
    <a
      href={fileUrl}
      target="_blank"
      rel="noreferrer"
      className="btn btn-sm btn-primary"
    >
      Open in new tab
    </a>
  );

  return (
    <Modal show={show} onHide={close} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ minHeight: 320 }}>
        {state.loading && (
          <div className="d-flex align-items-center justify-content-center" style={{ minHeight: 280 }}>
            <Spinner animation="border" role="status" />
            <span className="ms-2">Loading…</span>
          </div>
        )}

        {!state.loading && state.error && (
          <div className="alert alert-danger">
            <div className="mb-2">Couldn’t load the file: {state.error}</div>
            <div className="d-flex gap-2">
              <OpenInNewTab />
            </div>
          </div>
        )}

        {!state.loading && !state.error && state.blobUrl && (
          <>
          {isPdf && (
   <div style={{ height: "70vh" }}>
     <embed
       src={state.blobUrl}
       type="application/pdf"
       style={{ width: "100%", height: "100%", border: 0 }}
     />
     <div className="mt-3 d-flex gap-2">
       <DownloadButton />
       <OpenInNewTab />
     </div>
   </div>
 )}

            {isImage && (
              <div className="text-center">
                <img
                  src={state.blobUrl}
                  alt="preview"
                  style={{ maxWidth: "100%", maxHeight: "70vh", objectFit: "contain" }}
                />
                <div className="mt-3 d-flex gap-2 justify-content-center">
                  <DownloadButton />
                  <OpenInNewTab />
                </div>
              </div>
            )}

            {isVideo && (
              <div>
                <video
                  src={state.blobUrl}
                  controls
                  style={{ width: "100%", maxHeight: "70vh" }}
                />
                <div className="mt-3 d-flex gap-2">
                  <DownloadButton />
                  <OpenInNewTab />
                </div>
              </div>
            )}

            {isAudio && (
              <div>
                <audio src={state.blobUrl} controls style={{ width: "100%" }} />
                <div className="mt-3 d-flex gap-2">
                  <DownloadButton />
                  <OpenInNewTab />
                </div>
              </div>
            )}

            {isText && (
              <div style={{ maxHeight: "70vh", overflow: "auto", background: "#f8f9fa", padding: 12, borderRadius: 6 }}>
                <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                  {state.textPreview}
                </pre>
                <div className="mt-3 d-flex gap-2">
                  <DownloadButton />
                  <OpenInNewTab />
                </div>
              </div>
            )}

            {/* Unknown types (docx/xlsx/pptx, etc.) */}
            {!isPdf && !isImage && !isVideo && !isAudio && !isText && (
              <div className="alert alert-info">
                This file type isn’t previewable in the browser. You can download or open it:
                <div className="mt-3 d-flex gap-2">
                  <DownloadButton />
                  <OpenInNewTab />
                </div>
              </div>
            )}
          </>
        )}
      </Modal.Body>
    </Modal>
  );
}
