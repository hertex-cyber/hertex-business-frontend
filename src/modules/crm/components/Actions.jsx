import React, { useState } from 'react';
import { 
    Layout, 
    Layers, 
    Activity, 
    Users, 
    CreditCard, 
    HeartPulse, 
    ChevronRight 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import CreatePipelineModal from './CreatePipelineModal';
import ManageStageModal from './ManageStageModal';
import UserPipelineManager from './UserPipelineManager';

const ActionCard = ({ icon: Icon, title, description, colorClass, pipelineName, onClick }) => {
    return (
        <button 
            onClick={onClick}
            className="group relative flex flex-col items-start p-6 bg-zinc-900/30 border border-zinc-800 rounded-xl hover:border-zinc-700 hover:bg-zinc-900/50 transition-all duration-300 text-left overflow-hidden active:scale-[0.98] cursor-pointer"
        >
            {/* Ambient Background Glow */}
            <div className={cn(
                "absolute -right-8 -top-8 w-24 h-24 blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500",
                colorClass
            )} />

            <div className="w-full flex items-start justify-between mb-6">
                <div className={cn(
                    "w-12 h-12 rounded-lg flex items-center justify-center transition-transform duration-500 group-hover:scale-110",
                    "bg-zinc-950 border border-zinc-800",
                    colorClass.replace('bg-', 'text-')
                )}>
                    <Icon size={24} />
                </div>

                {pipelineName && (
                    <div className="px-3 py-1 rounded bg-white/5 border border-white/10 text-[9px] font-medium text-white/40 uppercase tracking-[0.2em]">
                        {pipelineName}
                    </div>
                )}
            </div>

            <div className="space-y-2 flex-1">
                <h3 className="text-sm font-medium text-white uppercase tracking-wider">{title}</h3>
                <p className="text-xs text-white/40 leading-relaxed font-medium">
                    {description}
                </p>
            </div>

            <div className="mt-6 flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.2em] text-white/20 group-hover:text-white/60 transition-colors">
                Configure
                <ChevronRight size={10} className="group-hover:translate-x-1 transition-transform" />
            </div>
        </button>
    );
};

const Actions = ({ selectedPipeline, pipelines, stages, departments = [], users = [], onPipelineCreated, onPipelineDeleted, onPipelineUpdated, onPipelineUpdatedForUsers, onStagesChanged }) => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isManageStageOpen, setIsManageStageOpen] = useState(false);
    const [isUserManagerOpen, setIsUserManagerOpen] = useState(false);

    const actionItems = [
        {
            id: 'manage-pipeline',
            icon: Layout,
            title: "Manage Pipeline",
            description: "Configure sales funnels, conversion stages, and global pipeline logic.",
            colorClass: "bg-white",
            showBadge: false,
            onClick: () => setIsCreateModalOpen(true)
        },
        {
            id: 'manage-stage',
            icon: Layers,
            title: "Manage Stage",
            description: "Define Kanban columns, probability weights, and stage-gate requirements.",
            colorClass: "bg-white",
            showBadge: true,
            onClick: () => setIsManageStageOpen(true)
        },
        {
            id: 'manage-status',
            icon: Activity,
            title: "Manage Status",
            description: "Customize deal outcome labels, lost reasons, and win state parameters.",
            colorClass: "bg-white",
            showBadge: true
        },
        {
            id: 'manage-users',
            icon: Users,
            title: "Manage Users",
            description: "Assign territory permissions, role-based access, and seat management.",
            colorClass: "bg-white",
            showBadge: true,
            onClick: () => setIsUserManagerOpen(true)
        },
        {
            id: 'manage-payment',
            icon: CreditCard,
            title: "Payment Actions",
            description: "Integrate billing gateways, automated invoicing, and collection triggers.",
            colorClass: "bg-white",
            showBadge: true
        },
        {
            id: 'lead-nurture',
            icon: HeartPulse,
            title: "Lead Nurture",
            description: "Set up drip sequences, automated follow-ups, and engagement scoring.",
            colorClass: "bg-white",
            showBadge: true
        }
    ];

    return (
        <div className="h-full overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {actionItems.map((item, idx) => (
                    <ActionCard 
                        key={item.id} 
                        {...item} 
                        pipelineName={item.showBadge ? selectedPipeline?.name : null}
                    />
                ))}
            </div>

            <CreatePipelineModal 
                isOpen={isCreateModalOpen} 
                onClose={() => setIsCreateModalOpen(false)}
                pipelines={pipelines}
                onSuccess={(newPipeline) => {
                    if (onPipelineCreated) onPipelineCreated(newPipeline);
                }}
                onDelete={onPipelineDeleted}
                onUpdate={onPipelineUpdated}
            />

            <ManageStageModal
                isOpen={isManageStageOpen}
                onClose={() => setIsManageStageOpen(false)}
                pipeline={selectedPipeline}
                stages={stages}
                onStagesChanged={onStagesChanged}
            />

            <UserPipelineManager
                isOpen={isUserManagerOpen}
                onClose={() => setIsUserManagerOpen(false)}
                departments={departments}
                users={users}
                pipelines={pipelines}
                selectedPipeline={selectedPipeline}
                onPipelineUpdated={onPipelineUpdatedForUsers}
            />
        </div>
    );
};

export default Actions;

