import React, { useState } from 'react';
import Card from './common/Card';
import { useAppContext } from '../hooks/useAppContext';
import { LearningArticle } from '../types';

const articles: LearningArticle[] = [
    { id: '1', titleKey: 'tip1_title', contentKey: 'tip1_content', icon: '💰' },
    { id: '2', titleKey: 'tip2_title', contentKey: 'tip2_content', icon: '😊' },
    { id: '3', titleKey: 'tip3_title', contentKey: 'tip3_content', icon: '📝' },
];

const Learning: React.FC = () => {
    const { t } = useAppContext();
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const toggleExpand = (id: string) => {
        setExpandedId(prevId => (prevId === id ? null : id));
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">{t('learning_hub_title')}</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">{t('learning_hub_subtitle')}</p>
            </div>

            <div className="space-y-4">
                {articles.map(article => (
                    <Card key={article.id} className="cursor-pointer" onClick={() => toggleExpand(article.id)}>
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <span className="text-3xl">{article.icon}</span>
                                <h2 className="text-xl font-bold">{t(article.titleKey)}</h2>
                            </div>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-6 h-6 text-slate-500 transition-transform ${expandedId === article.id ? 'rotate-180' : ''}`}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                            </svg>
                        </div>
                        {expandedId === article.id && (
                             <div className="mt-4 pt-4 border-t dark:border-slate-700">
                                 <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{t(article.contentKey)}</p>
                             </div>
                        )}
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default Learning;