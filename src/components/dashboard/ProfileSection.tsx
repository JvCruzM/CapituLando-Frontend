"use client";

import { useAuthenticatedUser } from "@/components/auth/AuthGuard";
import { useWorkspaceSection } from "./WorkspaceProvider";
import Image from "next/image";
import React, { useState } from "react";
import {
  User,
  Feather,
  BookOpen,
  Award,
  Sparkles,
  Edit3,
  Check,
  Heart,
  Globe,
  Mail,
  Save,
} from "lucide-react";

interface AuthorProfile {
  name: string;
  penName: string;
  email: string;
  bio: string;
  quote: string;
  favoriteGenres: string[];
  websiteUrl: string;
  avatarUrl: string;
}

const DEFAULT_PROFILE: AuthorProfile = {
  name: "",
  penName: "",
  email: "",
  bio: "",
  quote: "",
  favoriteGenres: [],
  websiteUrl: "",
  avatarUrl: "",
};

export function ProfileSection() {
  const user = useAuthenticatedUser()!;
  const [savedProfile, setProfile] = useWorkspaceSection<AuthorProfile>(
    "profile",
    DEFAULT_PROFILE,
  );
  const profile = {
    ...DEFAULT_PROFILE,
    ...savedProfile,
    name: savedProfile.name || user.displayName,
    email: user.email,
    penName: savedProfile.penName || user.displayName,
  };
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<AuthorProfile>(profile);
  const [genreInput, setGenreInput] = useState("");
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile({ ...formData, email: user.email });
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleAddGenre = () => {
    if (
      genreInput.trim() &&
      !formData.favoriteGenres.includes(genreInput.trim())
    ) {
      setFormData({
        ...formData,
        favoriteGenres: [...formData.favoriteGenres, genreInput.trim()],
      });
      setGenreInput("");
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="bg-[#f3ccde]/60 dark:bg-[#221a2b] p-5 rounded-2xl border-2 border-[#4b1d3f]/20 dark:border-[#382b47] flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#f3ccde] dark:bg-[#2a2035] text-[#4b1d3f] dark:text-pink-300 rounded-xl border border-[#4b1d3f]/30">
            <User size={28} />
          </div>
          <div>
            <h2 className="text-xl font-bold font-serif text-stone-900 dark:text-stone-100">
              Perfil do Autor
            </h2>
            <p className="text-xs text-stone-600 dark:text-stone-400">
              Dados sincronizados com o seu login/registo e personalizáveis.
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setIsEditing(!isEditing);
            setFormData(profile);
          }}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm ${isEditing ? "bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200" : "bg-[#4b1d3f] dark:bg-pink-800 text-white"}`}
        >
          <Edit3 size={16} />{" "}
          <span>{isEditing ? "Cancelar Edição" : "Editar Perfil"}</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-100 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2">
          <Check size={18} /> <span>Perfil atualizado com sucesso!</span>
        </div>
      )}

      {!isEditing ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-[#1a1321] border-2 border-[#4b1d3f]/20 dark:border-[#382b47] rounded-3xl p-6 shadow-sm flex flex-col items-center text-center space-y-4">
            {profile.avatarUrl ? (
              <Image
                width={112}
                height={112}
                unoptimized
                src={profile.avatarUrl}
                alt={profile.name || "Autor"}
                className="w-28 h-28 rounded-full object-cover border-4 border-[#f3ccde] dark:border-[#382b47] shadow-md"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-[#f3ccde] dark:bg-pink-900 border-4 border-[#4b1d3f]/30 flex items-center justify-center font-serif font-bold text-4xl text-[#4b1d3f] dark:text-pink-100 shadow-md">
                {profile.name ? (
                  profile.name.charAt(0).toUpperCase()
                ) : (
                  <User size={40} />
                )}
              </div>
            )}
            <div className="space-y-1">
              <h3 className="text-xl font-bold font-serif text-stone-900 dark:text-stone-100">
                {profile.name || "Nome não definido"}
              </h3>
              <p className="text-xs text-[#4b1d3f] dark:text-pink-300 font-semibold">
                Pseudónimo: {profile.penName || profile.name || "Não definido"}
              </p>
            </div>
            {profile.quote && (
              <div className="p-3 bg-stone-50 dark:bg-[#221a2b] border border-stone-200 dark:border-[#382b47] rounded-2xl w-full">
                <p className="text-xs font-serif italic text-stone-700 dark:text-stone-300">
                  &ldquo;{profile.quote}&rdquo;
                </p>
              </div>
            )}
            <div className="w-full pt-2 border-t border-stone-100 dark:border-stone-800 text-xs space-y-2 text-stone-600 dark:text-stone-400 text-left">
              {profile.email && (
                <div className="flex items-center gap-2">
                  <Mail
                    size={14}
                    className="text-[#4b1d3f] dark:text-pink-400 shrink-0"
                  />
                  <span className="truncate">{profile.email}</span>
                </div>
              )}
              {profile.websiteUrl && (
                <div className="flex items-center gap-2">
                  <Globe
                    size={14}
                    className="text-[#4b1d3f] dark:text-pink-400 shrink-0"
                  />
                  <a
                    href={profile.websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline truncate text-[#4b1d3f] dark:text-pink-300 font-semibold"
                  >
                    {profile.websiteUrl}
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="md:col-span-2 space-y-6">
            <div className="bg-white dark:bg-[#1a1321] border-2 border-[#4b1d3f]/20 dark:border-[#382b47] rounded-3xl p-6 shadow-sm space-y-3">
              <h4 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100 border-b border-[#4b1d3f]/15 dark:border-[#382b47] pb-2">
                Biografia Literária
              </h4>
              <p className="text-xs font-serif leading-relaxed text-stone-700 dark:text-stone-300 whitespace-pre-wrap">
                {profile.bio ||
                  'Nenhuma biografia registada ainda. Clique em "Editar Perfil" para escrever a sua biografia.'}
              </p>
            </div>

            <div className="bg-white dark:bg-[#1a1321] border-2 border-[#4b1d3f]/20 dark:border-[#382b47] rounded-3xl p-6 shadow-sm space-y-3">
              <h4 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100 border-b border-[#4b1d3f]/15 dark:border-[#382b47] pb-2 flex items-center gap-2">
                <Heart
                  size={18}
                  className="text-[#4b1d3f] dark:text-pink-400"
                />{" "}
                Géneros de Preferência
              </h4>
              <div className="flex flex-wrap gap-2">
                {profile.favoriteGenres.length > 0 ? (
                  profile.favoriteGenres.map((g) => (
                    <span
                      key={g}
                      className="px-3 py-1 bg-[#f3ccde]/50 dark:bg-[#221a2b] border border-[#4b1d3f]/20 dark:border-[#382b47] rounded-xl text-xs font-bold text-[#4b1d3f] dark:text-pink-300"
                    >
                      {g}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-stone-600 dark:text-stone-400 italic">
                    Nenhum género adicionado.
                  </span>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-[#1a1321] border-2 border-[#4b1d3f]/20 dark:border-[#382b47] rounded-3xl p-6 shadow-sm space-y-4">
              <h4 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100 border-b border-[#4b1d3f]/15 dark:border-[#382b47] pb-2 flex items-center gap-2">
                <Award
                  size={18}
                  className="text-[#4b1d3f] dark:text-pink-400"
                />{" "}
                Medalhas & Hábitos
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-stone-50 dark:bg-[#221a2b] border border-stone-200 dark:border-[#382b47] rounded-2xl flex items-center gap-3">
                  <div className="p-2 bg-[#f3ccde] text-[#4b1d3f] rounded-xl font-bold">
                    <Feather size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-stone-800 dark:text-stone-200">
                      Escrita Diária
                    </p>
                    <span className="text-[10px] text-stone-600 dark:text-stone-400">
                      Ativo
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-stone-50 dark:bg-[#221a2b] border border-stone-200 dark:border-[#382b47] rounded-2xl flex items-center gap-3">
                  <div className="p-2 bg-[#f3ccde] text-[#4b1d3f] rounded-xl font-bold">
                    <BookOpen size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-stone-800 dark:text-stone-200">
                      Capítulos
                    </p>
                    <span className="text-[10px] text-stone-600 dark:text-stone-400">
                      Registo
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-stone-50 dark:bg-[#221a2b] border border-stone-200 dark:border-[#382b47] rounded-2xl flex items-center gap-3">
                  <div className="p-2 bg-[#f3ccde] text-[#4b1d3f] rounded-xl font-bold">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-stone-800 dark:text-stone-200">
                      Worldbuilder
                    </p>
                    <span className="text-[10px] text-stone-600 dark:text-stone-400">
                      Ativo
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSave}
          className="bg-white dark:bg-[#1a1321] border-2 border-[#4b1d3f]/20 dark:border-[#382b47] rounded-3xl p-6 md:p-8 shadow-sm space-y-4 text-xs"
        >
          <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100 border-b border-[#4b1d3f]/20 dark:border-[#382b47] pb-3">
            Editar Informações do Perfil
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="profilesection-field-1"
                className="block font-bold text-stone-700 dark:text-stone-300 mb-1"
              >
                Nome Completo / Autor
              </label>
              <input
                id="profilesection-field-1"
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Seu nome"
                className="w-full p-2.5 bg-stone-50 dark:bg-[#221a2b] border border-stone-200 dark:border-[#382b47] rounded-xl text-stone-800 dark:text-stone-100"
              />
            </div>
            <div>
              <label
                htmlFor="profilesection-field-2"
                className="block font-bold text-stone-700 dark:text-stone-300 mb-1"
              >
                Pseudónimo Literário
              </label>
              <input
                id="profilesection-field-2"
                type="text"
                value={formData.penName}
                onChange={(e) =>
                  setFormData({ ...formData, penName: e.target.value })
                }
                placeholder="Ex: J. K. Rowling"
                className="w-full p-2.5 bg-stone-50 dark:bg-[#221a2b] border border-stone-200 dark:border-[#382b47] rounded-xl text-stone-800 dark:text-stone-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="profilesection-field-3"
                className="block font-bold text-stone-700 dark:text-stone-300 mb-1"
              >
                Email do Autor
              </label>
              <input
                id="profilesection-field-3"
                type="email"
                value={formData.email}
                readOnly
                title="Altere seu e-mail nas configurações da conta."
                placeholder="autor@exemplo.com"
                className="w-full p-2.5 bg-stone-50 dark:bg-[#221a2b] border border-stone-200 dark:border-[#382b47] rounded-xl text-stone-800 dark:text-stone-100"
              />
            </div>
            <div>
              <label
                htmlFor="profilesection-field-4"
                className="block font-bold text-stone-700 dark:text-stone-300 mb-1"
              >
                Website / Redes Sociais (URL)
              </label>
              <input
                id="profilesection-field-4"
                type="url"
                value={formData.websiteUrl}
                onChange={(e) =>
                  setFormData({ ...formData, websiteUrl: e.target.value })
                }
                placeholder="https://seu-site.com"
                className="w-full p-2.5 bg-stone-50 dark:bg-[#221a2b] border border-stone-200 dark:border-[#382b47] rounded-xl text-stone-800 dark:text-stone-100"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="profilesection-field-5"
              className="block font-bold text-stone-700 dark:text-stone-300 mb-1"
            >
              URL da Foto / Avatar
            </label>
            <input
              id="profilesection-field-5"
              type="url"
              value={formData.avatarUrl}
              onChange={(e) =>
                setFormData({ ...formData, avatarUrl: e.target.value })
              }
              placeholder="https://exemplo.com/sua-foto.jpg"
              className="w-full p-2.5 bg-stone-50 dark:bg-[#221a2b] border border-stone-200 dark:border-[#382b47] rounded-xl text-stone-800 dark:text-stone-100"
            />
          </div>

          <div>
            <label
              htmlFor="profilesection-field-6"
              className="block font-bold text-stone-700 dark:text-stone-300 mb-1"
            >
              Lema / Citação Inspiradora
            </label>
            <input
              id="profilesection-field-6"
              type="text"
              value={formData.quote}
              onChange={(e) =>
                setFormData({ ...formData, quote: e.target.value })
              }
              placeholder="Uma frase que inspira a sua escrita..."
              className="w-full p-2.5 bg-stone-50 dark:bg-[#221a2b] border border-stone-200 dark:border-[#382b47] rounded-xl text-stone-800 dark:text-stone-100"
            />
          </div>

          <div>
            <label
              htmlFor="profilesection-field-7"
              className="block font-bold text-stone-700 dark:text-stone-300 mb-1"
            >
              Biografia Literária
            </label>
            <textarea
              id="profilesection-field-7"
              rows={4}
              value={formData.bio}
              onChange={(e) =>
                setFormData({ ...formData, bio: e.target.value })
              }
              placeholder="Escreva um pouco sobre a sua jornada como autor(a)..."
              className="w-full p-2.5 bg-stone-50 dark:bg-[#221a2b] border border-stone-200 dark:border-[#382b47] rounded-xl text-stone-800 dark:text-stone-100"
            />
          </div>

          <div>
            <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
              Géneros Favoritos
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Adicionar género (ex: Fantasia, Drama)..."
                value={genreInput}
                onChange={(e) => setGenreInput(e.target.value)}
                className="flex-1 p-2 bg-stone-50 dark:bg-[#221a2b] border border-stone-200 dark:border-[#382b47] rounded-xl text-stone-800 dark:text-stone-100"
              />
              <button
                type="button"
                onClick={handleAddGenre}
                className="px-3 py-2 bg-[#4b1d3f] text-white rounded-xl font-bold"
              >
                Adicionar
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {formData.favoriteGenres.map((g) => (
                <span
                  key={g}
                  className="px-2.5 py-1 bg-[#f3ccde]/60 dark:bg-[#221a2b] border border-[#4b1d3f]/20 rounded-lg text-stone-800 dark:text-stone-200 font-semibold flex items-center gap-1"
                >
                  {g}{" "}
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        favoriteGenres: formData.favoriteGenres.filter(
                          (item) => item !== g,
                        ),
                      })
                    }
                    className="text-red-500 font-bold ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-[#4b1d3f]/20 dark:border-[#382b47]">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 rounded-xl font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#4b1d3f] hover:bg-[#38142f] text-white rounded-xl font-bold flex items-center gap-1 shadow-sm"
            >
              <Save size={16} /> Salvar Perfil
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
