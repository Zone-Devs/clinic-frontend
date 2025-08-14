"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { InitialEquipmentProps } from "./EquipmentTable";
import Image from "next/image";
import { Save, X, Upload, ImageIcon, QrCode, Loader2, ImageUp, RefreshCw, RotateCw } from "lucide-react";
import { ImageViewer } from "@/app/components/ImageViewer";

interface Props {
  equipment: InitialEquipmentProps;
  onConfirm: (data: { name: string; description: string }) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const EditEquipmentForm = React.memo(function EditEquipmentForm({
  equipment,
  onConfirm,
  onCancel,
  isLoading = false,
}: Props) {
  const [name, setName] = useState("");
  const [model, setModel] = useState("");
  const [description, setDescription] = useState("");

  // carga/errores
  const [imgLoading, setImgLoading] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState(false);

  // preview local si el usuario elige "Cambiar imagen"
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // viewer
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  useEffect(() => {
    setName(equipment.name);
    setModel(equipment.model);
    setDescription(equipment.description);
    // limpiar blob previo al cambiar de equipo
    setPreview((old) => {
      if (old?.startsWith("blob:")) URL.revokeObjectURL(old);
      return null;
    });
  }, [equipment]);

  useEffect(() => {
    return () => {
      // cleanup blob en unmount
      setPreview((old) => {
        if (old?.startsWith("blob:")) URL.revokeObjectURL(old);
        return old;
      });
    };
  }, []);

  const pickImage = () => fileInputRef.current?.click();
  const onPickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.currentTarget.value = ""; // permite reseleccionar el mismo archivo
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview((old) => {
      if (old?.startsWith("blob:")) URL.revokeObjectURL(old);
      return url;
    });
    setImgError(false);
    setImgLoading(true);
  };

  // fuentes
  const imageSrc = preview ?? (equipment as any).imageURL ?? null;
  const proxiedImg = imageSrc
    ? imageSrc.startsWith("blob:")
      ? imageSrc
      : `/api/proxy/files?src=${encodeURIComponent(imageSrc)}`
    : null;

  const primaryQr =
    (equipment as any)?.qrs?.[0]?.qrImageURL ??
    (equipment as any)?.qrImageURL ??
    null;
  const proxiedQr = primaryQr
    ? `/api/proxy/files?src=${encodeURIComponent(primaryQr)}`
    : null;

  useEffect(() => {
    setImgError(false);
    setImgLoading(!!proxiedImg);
  }, [proxiedImg]);

  useEffect(() => {
    setQrError(false);
    setQrLoading(!!proxiedQr);
  }, [proxiedQr]);

  // items para el visor
  const viewerItems = React.useMemo(() => {
    const items: { src: string; title: string }[] = [];
    if (proxiedImg)
      items.push({
        src: proxiedImg,
        title: equipment.name || "Imagen del equipo",
      });
    if (proxiedQr) items.push({ src: proxiedQr, title: "Código QR" });
    return items;
  }, [proxiedImg, proxiedQr, equipment.name]);

  const openViewer = (which: "img" | "qr") => {
    const hasImg = !!proxiedImg;
    const hasQr = !!proxiedQr;
    if (!hasImg && !hasQr) return;
    setViewerIndex(which === "img" ? 0 : hasImg ? 1 : 0);
    setViewerOpen(true);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Editar equipo</DialogTitle>
        <DialogDescription>
          Modifica la información del equipo.
        </DialogDescription>
      </DialogHeader>

      {/* Layout: izquierda campos, derecha imagen + QR */}
      <div className="py-2 md:flex md:gap-6 md:items-stretch">
              {/* Columna izquierda: campos */}
        <div className="flex-1 flex flex-col gap-3">
          <label className="block">
            <span className="text-sm font-medium">Nombre</span>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded border px-3 py-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Sutura"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Modelo / Nº de serie</span>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded border px-3 py-2"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="Escribe el modelo de tu equipo"
            />
          </label>

          {/* Textarea que ocupa el resto del alto */}
          <label className="flex-1 flex flex-col">
            <span className="text-sm font-medium">Descripción</span>
            <textarea
              required
              // clave: que crezca y no se pueda redimensionar
              className="mt-1 block w-full flex-1 resize-none rounded border px-3 py-2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Una breve descripción del equipo"
            />
          </label>
        </div>

        {/* Columna derecha: imagen + cambiar + QR */}
        <div className="
            w-full md:w-auto shrink-0 mt-4 md:mt-0 md:self-start
            flex gap-3 items-start justify-start
            overflow-x-auto
            md:flex-col md:gap-0 md:space-y-4 md:overflow-visible">
          {/* Imagen / Fallback */}
          <div className="border rounded-lg p-2 w-fit mx-auto">
                <div className="flex items-center mb-2">
              <ImageUp className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Imagen</span>
            </div>
            <div
              className="relative w-[112px] h-[112px] rounded overflow-hidden border cursor-zoom-in"
              role="button"
              tabIndex={0}
              onClick={() => proxiedImg && openViewer('img')}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && proxiedImg && openViewer('img')}
            >
              {proxiedImg && !imgError ? (
                <Image
                  src={proxiedImg}
                  alt="Imagen del equipo"
                  fill
                  sizes="112px"
                  className={imgLoading ? 'object-cover blur-[1.5px] transition' : 'object-cover transition'}
                  onLoadingComplete={() => setImgLoading(false)}
                  onError={() => { setImgLoading(false); setImgError(true) }}
                />
              ) : (
                <div className="h-full w-full flex flex-col items-center justify-center text-muted-foreground">
                  <ImageIcon className="h-6 w-6 mb-1" />
                  <span className="text-[11px]">Sin imagen</span>
                </div>
              )}

              {imgLoading && (
                <div className="absolute inset-0 grid place-items-center pointer-events-none">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>

            <div className="mt-2">
              <Button variant="outline" onClick={pickImage} className="w-full">
                <RefreshCw className="h-1 w-1" />
                Actualizar
              </Button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onPickImage}
            />
          </div>

          {/* QR */}
          <div className="border rounded-lg p-2 w-fit mx-auto">
            <div className="flex items-center mb-2">
              <QrCode className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Código QR</span>
            </div>

            <div
              className="relative w-[112px] h-[112px] rounded overflow-hidden border cursor-zoom-in"
              role="button"
              tabIndex={0}
              onClick={() => proxiedQr && openViewer('qr')}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && proxiedQr && openViewer('qr')}
            >
              {proxiedQr && !qrError ? (
                <Image
                  src={proxiedQr}
                  alt="QR del equipo"
                  fill
                  sizes="112px"
                  className={qrLoading ? 'object-contain p-1 blur-[1.5px] transition' : 'object-contain p-1 transition'}
                  onLoadingComplete={() => setQrLoading(false)}
                  onError={() => { setQrLoading(false); setQrError(true) }}
                />
              ) : (
                <span className="absolute inset-0 grid place-items-center text-[11px] text-muted-foreground">
                  QR no disponible
                </span>
              )}

              {qrLoading && (
                <div className="absolute inset-0 grid place-items-center pointer-events-none">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="mt-2">
              <Button variant="outline" onClick={pickImage} className="w-full">
                <RotateCw className="h-1 w-1" />
                Renovar
              </Button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onPickImage}
            />
          </div>
        </div>
      </div>

      {/* Visor */}
      <ImageViewer
        items={viewerItems}
        index={viewerIndex}
        open={viewerOpen}
        onOpenChange={setViewerOpen}
        onIndexChange={setViewerIndex}
      />

      <DialogFooter className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          <X />
          Cancelar
        </Button>
        <Button
          onClick={() =>
            onConfirm({
              name: name.trim(),
              description: description.trim(),
            })
          }
          isLoading={isLoading}
          disabled={!name.trim() || !description.trim()}
        >
          {!isLoading && <Save />}
          Guardar
        </Button>
      </DialogFooter>
    </>
  );
});
