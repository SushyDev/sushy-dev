precision highp float;
uniform vec2 iResolution;
uniform vec2 iMouse;
uniform float iTime;
uniform float speed;
uniform vec3 skyColor;
uniform vec3 cloudColor;
uniform vec3 lightColor;

#define NUM_STEPS 200.0
#define NUM_NOISE_OCTAVES 4.0
#define HEIGHT_OFFSET 1.25
#define WHITE_NOISE_GRID_SIZE 256.0

// from "Hash without Sine" https://www.shadertoy.com/view/4djSRW
#define HASHSCALE1 443.8975

float hash12(vec2 p)
{
    vec3 p3  = fract(vec3(p.xyx) * HASHSCALE1);
    p3 += dot(p3, p3.yzx + 19.19);
    return fract((p3.x + p3.y) * p3.z);
}

float BilinearInterpolateWhiteNoise (vec2 uv)
{
    uv = fract(uv);

    vec2 uvPixels = uv * WHITE_NOISE_GRID_SIZE;

    vec2 uvFrac = uvPixels - floor(uvPixels);

    vec2 uvDiscreteFloor = floor(uvPixels) / WHITE_NOISE_GRID_SIZE;
    vec2 uvDiscreteCeil = ceil(uvPixels) / WHITE_NOISE_GRID_SIZE;

    float noise00 = hash12(vec2(uvDiscreteFloor.x, uvDiscreteFloor.y));
    float noise01 = hash12(vec2(uvDiscreteFloor.x, uvDiscreteCeil.y ));
    float noise10 = hash12(vec2(uvDiscreteCeil.x , uvDiscreteFloor.y));
    float noise11 = hash12(vec2(uvDiscreteCeil.x , uvDiscreteCeil.y ));

    float noise0_ = mix(noise00, noise01, uvFrac.y);
    float noise1_ = mix(noise10, noise11, uvFrac.y);

    float noise = mix(noise0_, noise1_, uvFrac.x);

    return noise;
}

float RandomNumber (in vec3 position)
{
    vec2 uv = (position.yz+ceil(position.x))/float(NUM_STEPS);
    return BilinearInterpolateWhiteNoise(uv);
}

void main(){
    vec2 coord = gl_FragCoord.xy;

    vec3 direction = vec3(1.0, coord / iResolution.y - 0.5);
    vec3 pixelColor = skyColor - direction.z;

    for (float i = 1.0; i <= (NUM_STEPS / 2.0); i += 1.0) {
        float noiseScale = 0.5;
        float remaining = (NUM_STEPS / 2.0) - i;
        vec3 position = 0.05 * remaining * direction;
        float signedDistance = position.z + HEIGHT_OFFSET;

        position.xy += iTime * 0.5 * speed;

        for (float octaveIndex = 1.0; octaveIndex < NUM_NOISE_OCTAVES; octaveIndex += 1.0) {
            position *= 2.25;
            noiseScale *= 2.25;
            signedDistance -= RandomNumber(position) / noiseScale;
        }

        if (signedDistance < 0.0) {
            vec3 shading = mix(lightColor, skyColor, -signedDistance);
            pixelColor = mix(pixelColor, shading, -signedDistance * 0.3);
        }
    }

    gl_FragColor = vec4(pixelColor, 1);
}
