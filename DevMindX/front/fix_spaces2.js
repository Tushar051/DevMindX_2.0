import fs from 'fs';
import path from 'path';

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.tsx') && fullPath.includes('Header')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let original = content;
            
            // Fix spaces - any whitespace between })) and </span> is replaced with Non-breaking space
            let newContent = content.replace(/\}\)\)\s*<\/span>/g, '}))\n                        {"\\u00A0"}\n                    </span>');
            
            if (original !== newContent) {
                fs.writeFileSync(fullPath, newContent, 'utf8');
                console.log('Fixed:', fullPath);
            }
        }
    }
}
processDir('c:/Users/tusha/Desktop/DevMindX/DevMindX/front/src/sections');
