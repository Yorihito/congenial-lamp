import React from 'react';
import type { MapNode } from '../../types/map';
import './NodeDetail.css';

interface NodeDetailProps {
    node: MapNode;
    onClose: () => void;
    onLabelEdit?: (nodeId: string, newLabel: string) => void;
}

// Distance labels in Japanese (no numbers per requirements)
const DISTANCE_LABELS = {
    near: '距離が近い',
    mid: '適度な距離',
    far: '距離がある',
};

export const NodeDetail: React.FC<NodeDetailProps> = ({
    node,
    onClose,
    onLabelEdit,
}) => {
    const [isEditing, setIsEditing] = React.useState(false);
    const [editLabel, setEditLabel] = React.useState(node.customLabel || node.label);

    const handleSaveLabel = () => {
        if (onLabelEdit && editLabel.trim()) {
            onLabelEdit(node.id, editLabel.trim());
        }
        setIsEditing(false);
    };

    return (
        <div className="node-detail-overlay" onClick={onClose}>
            <div className="node-detail-card animate-fade-in" onClick={(e) => e.stopPropagation()}>
                <button className="node-detail-close" onClick={onClose}>
                    ×
                </button>

                <div className="node-detail-header">
                    <div
                        className="node-detail-indicator"
                        style={{ backgroundColor: node.color }}
                    />
                    {isEditing ? (
                        <input
                            type="text"
                            className="node-detail-label-input"
                            value={editLabel}
                            onChange={(e) => setEditLabel(e.target.value)}
                            maxLength={12}
                            autoFocus
                            onBlur={handleSaveLabel}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveLabel();
                                if (e.key === 'Escape') setIsEditing(false);
                            }}
                        />
                    ) : (
                        <h2
                            className="node-detail-label"
                            onClick={() => onLabelEdit && setIsEditing(true)}
                            title={onLabelEdit ? 'タップして編集' : undefined}
                        >
                            {node.customLabel || node.label}
                        </h2>
                    )}
                </div>

                <div className="node-detail-distance">
                    <span className="distance-badge" data-distance={node.position.distance}>
                        {DISTANCE_LABELS[node.position.distance]}
                    </span>
                </div>

                <div className="node-detail-observation">
                    <p>{node.observationText}</p>
                </div>

                <div className="node-detail-footer">
                    <span className="hint-text">
                        {onLabelEdit ? 'ラベルをタップして編集できます' : ''}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default NodeDetail;
