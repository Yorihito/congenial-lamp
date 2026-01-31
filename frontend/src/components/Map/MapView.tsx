import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { MapNode } from '../../types/map';
import './MapView.css';

interface MapViewProps {
    nodes: MapNode[];
    onNodeClick?: (node: MapNode) => void;
    centerLabel?: string;
}

export const MapView: React.FC<MapViewProps> = ({
    nodes,
    onNodeClick,
    centerLabel = 'あなた',
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!svgRef.current || nodes.length === 0) return;

        const svg = d3.select(svgRef.current);
        const width = 400;
        const height = 400;
        const centerX = width / 2;
        const centerY = height / 2;

        // Clear previous content
        svg.selectAll('*').remove();

        // Set viewBox for responsive scaling
        svg
            .attr('viewBox', `0 0 ${width} ${height}`)
            .attr('preserveAspectRatio', 'xMidYMid meet');

        // Add subtle background grid
        const grid = svg.append('g').attr('class', 'grid');
        [60, 120, 170].forEach((r) => {
            grid
                .append('circle')
                .attr('cx', centerX)
                .attr('cy', centerY)
                .attr('r', r)
                .attr('fill', 'none')
                .attr('stroke', 'rgba(255,255,255,0.05)')
                .attr('stroke-dasharray', '4,4');
        });

        // Add center node (You)
        const centerGroup = svg.append('g').attr('class', 'center-node');

        centerGroup
            .append('circle')
            .attr('cx', centerX)
            .attr('cy', centerY)
            .attr('r', 35)
            .attr('fill', 'var(--color-bg-card)')
            .attr('stroke', 'var(--color-secondary)')
            .attr('stroke-width', 2)
            .style('filter', 'drop-shadow(0 0 10px rgba(78, 205, 196, 0.3))');

        centerGroup
            .append('text')
            .attr('x', centerX)
            .attr('y', centerY)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('fill', 'var(--color-text)')
            .attr('font-size', '14px')
            .attr('font-weight', '600')
            .text(centerLabel);

        // Add relationship nodes
        const nodeGroups = svg
            .selectAll('.node')
            .data(nodes)
            .join('g')
            .attr('class', 'node')
            .attr('cursor', 'pointer')
            .on('click', (_event, d) => {
                if (onNodeClick) {
                    onNodeClick(d);
                }
            });

        // Node circles
        nodeGroups
            .append('circle')
            .attr('cx', (d) => d.position.x)
            .attr('cy', (d) => d.position.y)
            .attr('r', 0)
            .attr('fill', (d) => d.color)
            .attr('opacity', 0.9)
            .style('filter', 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))')
            .transition()
            .duration(600)
            .delay((_, i) => i * 100)
            .attr('r', 25);

        // Node labels
        nodeGroups
            .append('text')
            .attr('x', (d) => d.position.x)
            .attr('y', (d) => d.position.y)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('fill', '#fff')
            .attr('font-size', '11px')
            .attr('font-weight', '500')
            .attr('opacity', 0)
            .text((d) => d.customLabel || d.label)
            .transition()
            .duration(400)
            .delay((_, i) => i * 100 + 300)
            .attr('opacity', 1);

        // Add subtle connection lines
        const lines = svg.insert('g', '.node').attr('class', 'connections');
        nodes.forEach((node) => {
            lines
                .append('line')
                .attr('x1', centerX)
                .attr('y1', centerY)
                .attr('x2', centerX)
                .attr('y2', centerY)
                .attr('stroke', 'rgba(255,255,255,0.1)')
                .attr('stroke-width', 1)
                .transition()
                .duration(600)
                .attr('x2', node.position.x)
                .attr('y2', node.position.y);
        });

    }, [nodes, centerLabel, onNodeClick]);

    return (
        <div className="map-view-container" ref={containerRef}>
            <svg ref={svgRef} className="map-svg" />
            <p className="map-footer">いくつかの最近の行動から配置されています。</p>
        </div>
    );
};

export default MapView;
