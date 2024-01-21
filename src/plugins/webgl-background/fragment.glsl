precision highp float;
uniform vec2 iRes;
uniform float iTime;
uniform float spd;
uniform vec4 sC;
uniform vec3 lC;
const float STEPS = 200.0;
const float NS_OCT = 4.0;
const float H_OFFSET = 1.25;
const float WN_GS = 256.0;
float hash12(vec2 p) { vec3 p3  = fract(vec3(p.xyx) * 443.8975); p3 += dot(p3, p3.yzx + 19.19); return fract((p3.x + p3.y) * p3.z); }
float BIWN (vec2 uv) {
    uv = fract(uv);
    vec2 uvPx = uv * WN_GS;
    vec2 uvFrac = uvPx - floor(uvPx);
    vec2 uvDF = floor(uvPx) / WN_GS;
    vec2 uvDC = ceil(uvPx) / WN_GS;
    float ns00 = hash12(vec2(uvDF.x, uvDF.y));
    float ns01 = hash12(vec2(uvDF.x, uvDC.y ));
    float ns10 = hash12(vec2(uvDC.x , uvDF.y));
    float ns11 = hash12(vec2(uvDC.x , uvDC.y ));
    float ns0_ = mix(ns00, ns01, uvFrac.y);
    float ns1_ = mix(ns10, ns11, uvFrac.y);
    float noise = mix(ns0_, ns1_, uvFrac.x);
    return noise;
}
float RN (in vec3 p) { vec2 uv = (p.yz+ceil(p.x))/float(STEPS); return BIWN(uv); }
void main() {
    vec2 c = gl_FragCoord.xy;
    vec3 d = vec3(1.0, c / iRes.y - 0.5);
    vec4 pc = sC;
    for (float i = 1.0; i <= (STEPS / 2.0); i += 1.0) {
        float ns = 0.5;
        float r = (STEPS / 2.0) - i;
        vec3 p = 0.05 * r * d;
        float sD = p.z + H_OFFSET;
        p.xy += iTime * 0.5 * spd;
        for (float oct = 1.0; oct < NS_OCT; oct += 1.0) {
            p *= 2.25; ns *= 2.25;
            sD -= RN(p) / ns;
        }
        if (sD < 0.0) {
            vec4 shade = mix(vec4(lC, 1.0), sC, -sD);
            pc = mix(pc, shade, -sD * 0.3);
        }
    }
    gl_FragColor = pc;
}
