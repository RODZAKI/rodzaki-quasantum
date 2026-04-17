import React, { useEffect } from 'react';
import { useStore } from '../lib/store';
import { getCorpusThreads, getFields } from '../lib/services';
import ArtifactCard from './ArtifactCard';
import { Globe } from 'lucide-react';

export default function PublicArtifacts() {
  const { artifacts, fields, setArtifacts, setFields } = useStore();

  useEffect(() => {
    async function load() {
      const data = await getCorpusThreads();
      setArtifacts(data);
      console.log("CORPUS THREADS:", data.length, data[0]);
    }
    load();

    if (fields.length === 0) {
      getFields()
        .then(setFields)
        .catch(err => console.error('FIELD LOAD ERROR:', err));
    }
  }, []);

  const publicArtifacts = artifacts;

  if (publicArtifacts.length === 0) return null;

  return (
    <section className="py-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-semibold tracking-widest uppercase text-teal-400 mb-3 block">Public Surface</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Featured Public Artifacts</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Artifacts made public by their Field Stewards. Explore the emerging knowledge structures across sovereign cognitive spaces.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {publicArtifacts.map(artifact => (
            <div key={artifact.id}>
              {artifact.title || artifact.id}
            </div>
          ))}
          {/* DIAGNOSTIC — original map commented out:
          {publicArtifacts.map(a => {
            const field = fields.find(f => f.id === a.field_id);
            return (
              <div key={a.id} className="relative">
                {field && (
                  <div className="absolute -top-2 left-4 z-10">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
                      <Globe className="w-2.5 h-2.5 text-teal-400" />
                      {field.name}
                    </span>
                  </div>
                )}
                <div onClick={() => {
                  useStore.getState().setView('artifact-detail', a.field_id, a.id);
                }}>
                  <ArtifactCard artifact={a} />
                </div>
              </div>
            );
          })}
          */}
        </div>
      </div>
    </section>
  );
}