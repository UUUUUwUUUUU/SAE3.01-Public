import React from 'react';
import { IconAppstore, IconUnorderedList } from '@icons';
import TaxonRank from '@/types/TaxonRank';
import { getDisplayName } from '@/types/TaxonRank';

interface SearchNavBarProps {
    isGridMode: boolean;
    handleModeSwitch: () => void;
    selectedRank: TaxonRank;
    handleRankChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
    theme: string;
    CanSelectAll?: boolean;
}

const SearchNavBar: React.FC<SearchNavBarProps> = ({ isGridMode, handleModeSwitch, selectedRank, handleRankChange, theme, CanSelectAll }) => {
    return (
        <div className={`navbar bg-${theme} rounded `}>
            <div className='container-fluid'>
                {isGridMode ? (
                    <button type="button" className="btn btn-secondary" onClick={handleModeSwitch} style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        <IconUnorderedList />
                    </button>
                ) : (
                    <button type="button" className="btn btn-secondary" onClick={handleModeSwitch} style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        <IconAppstore />
                    </button>
                )}
                <div>
                    <select value={selectedRank} onChange={handleRankChange} className="form-select border-0" style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: '#6c757d',
                        color: '#fff',
                        backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23fff' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e\")"
                    }}>
                        {Object.values(TaxonRank).map(rank => {
                            if (!CanSelectAll && rank === TaxonRank.TOUT) {
                                return null;
                            }
                            return (
                                <option key={rank} value={rank}>{getDisplayName(rank)}</option>
                            );
                        })}
                    </select>
                </div>
            </div>
        </div >
    );
};

export default SearchNavBar;