interface MascotProps {
    animal: 'cow' | 'bull';
    className?: string;
    happy?: boolean;
}

/** Original vector characters: decorative, so game information is always text. */
export default function Mascot({ animal, className = '', happy = false }: MascotProps) {
    const bull = animal === 'bull';
    const ink = '#253d35';
    return (
        <svg className={className} viewBox="0 0 240 240" fill="none" aria-hidden="true">
            <ellipse cx="123" cy="220" rx="72" ry="10" fill={ink} opacity=".1" />
            <path d="M70 166 60 210Q72 220 87 210L98 180M148 179 155 211Q172 220 182 208L170 163" fill={bull ? '#b97550' : '#fff9eb'} stroke={ink} strokeWidth="5" strokeLinejoin="round" />
            <path d="M76 199 87 204 86 212 63 212 64 204M156 202 178 200 182 210 158 214" fill={ink} />
            <path d="M62 156Q42 184 30 160" stroke={ink} strokeWidth="5" strokeLinecap="round" />
            <path d="M26 153Q17 160 28 171Q38 166 33 155Z" fill={bull ? '#b97550' : '#fff9eb'} stroke={ink} strokeWidth="4" />
            <path d="M68 131Q51 164 66 188Q119 213 176 185Q190 162 171 128Z" fill={bull ? '#b97550' : '#fff9eb'} stroke={ink} strokeWidth="5" />
            {!bull && <path d="M76 145Q106 136 103 157T77 183L65 173Z" fill={ink} />}
            <path d="M70 83Q34 83 37 110Q52 119 73 105M170 83Q205 80 204 107Q190 121 170 105" fill={bull ? '#b97550' : '#fff9eb'} stroke={ink} strokeWidth="5" />
            <path d="M48 98 63 99M182 99 194 96" stroke={bull ? '#e7aa86' : '#efa89e'} strokeWidth="7" strokeLinecap="round" />
            <path d="M72 75Q41 64 53 35Q59 56 84 53M157 54Q184 52 187 33Q201 64 171 77" fill="#f5d489" stroke={ink} strokeWidth="5" strokeLinejoin="round" />
            <path d="M65 85Q66 48 120 49Q173 47 177 85L177 126Q172 162 121 165Q70 163 65 128Z" fill={bull ? '#b97550' : '#fff9eb'} stroke={ink} strokeWidth="5" />
            {!bull && <path d="M76 63Q106 44 127 53Q122 82 105 85Q83 85 76 63" fill={ink} />}
            {bull && <path d="m99 51 9-17 12 12 13-14 7 20" fill="#925536" stroke={ink} strokeWidth="5" strokeLinejoin="round" />}
            {happy ? (
                <g stroke={ink} strokeWidth="5" strokeLinecap="round">
                    <path d="M85 103q8-13 16 0M141 103q8-13 16 0" />
                </g>
            ) : (
                <g fill={ink}>
                    <ellipse cx="94" cy="100" rx="5" ry="7" />
                    <ellipse cx="149" cy="100" rx="5" ry="7" />
                </g>
            )}
            {bull && <path d="m82 85 19 4m40 0 18-5" stroke={ink} strokeWidth="5" strokeLinecap="round" />}
            <ellipse cx="80" cy="117" rx="10" ry="6" fill="#ef9a87" opacity=".7" />
            <ellipse cx="163" cy="117" rx="10" ry="6" fill="#ef9a87" opacity=".7" />
            <path d="M79 132Q78 114 120 114Q163 114 164 133Q164 155 121 156Q80 156 79 132Z" fill={bull ? '#e7aa86' : '#f2b5a7'} stroke={ink} strokeWidth="5" />
            <ellipse cx="103" cy="132" rx="4" ry="5" fill={ink} />
            <ellipse cx="141" cy="132" rx="4" ry="5" fill={ink} />
            <path d="M112 144q9 6 18-1" stroke={ink} strokeWidth="3.5" strokeLinecap="round" />
            <path d="m75 163 45 13 49-14-5 18-43 11-41-13Z" fill={bull ? '#ee8069' : '#e7be47'} stroke={ink} strokeWidth="4" strokeLinejoin="round" />
            <path d="m117 178 13 5-9 17-10-14Z" fill={bull ? '#ee8069' : '#e7be47'} stroke={ink} strokeWidth="3" />
        </svg>
    );
}
