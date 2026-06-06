import 'package:flutter/material.dart';

/// Logotipo programático de RescateYa: cuadrado negro redondeado con letra "R" blanca.
/// Diseño B&W — alineado con el logotipo del panel web.
///
/// Uso:
///   const RescateYaLogo(size: 72)              // estático
///   const RescateYaLogo(size: 80, pulse: true)  // con anillo pulsante
class RescateYaLogo extends StatefulWidget {
  final double size;
  final bool pulse;

  const RescateYaLogo({super.key, this.size = 72, this.pulse = false});

  @override
  State<RescateYaLogo> createState() => _RescateYaLogoState();
}

class _RescateYaLogoState extends State<RescateYaLogo>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl;
  late final Animation<double> _scale;
  late final Animation<double> _opacity;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2200),
    );
    _scale = Tween<double>(begin: 1.0, end: 1.8).animate(
      CurvedAnimation(parent: _ctrl, curve: Curves.easeOut),
    );
    _opacity = Tween<double>(begin: 0.35, end: 0.0).animate(
      CurvedAnimation(parent: _ctrl, curve: Curves.easeOut),
    );
    if (widget.pulse) _ctrl.repeat();
  }

  @override
  void didUpdateWidget(RescateYaLogo oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.pulse && !_ctrl.isAnimating) {
      _ctrl.repeat();
    } else if (!widget.pulse) {
      _ctrl.stop();
    }
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final s = widget.size;
    final innerSize = s * 0.72;
    final radius = innerSize * 0.22;

    return SizedBox(
      width: s,
      height: s,
      child: Stack(
        alignment: Alignment.center,
        children: [
          // Anillo pulsante sutil (gris, no naranja)
          if (widget.pulse)
            AnimatedBuilder(
              animation: _ctrl,
              builder: (_, __) => Transform.scale(
                scale: _scale.value,
                child: Opacity(
                  opacity: _opacity.value,
                  child: Container(
                    width: innerSize,
                    height: innerSize,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(radius),
                      border: Border.all(
                        color: const Color(0xFF111111),
                        width: 2,
                      ),
                    ),
                  ),
                ),
              ),
            ),

          // Cuadrado negro con "R" blanca
          Container(
            width: innerSize,
            height: innerSize,
            decoration: BoxDecoration(
              color: const Color(0xFF111111),
              borderRadius: BorderRadius.circular(radius),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.18),
                  blurRadius: 16,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            alignment: Alignment.center,
            child: Text(
              'R',
              style: TextStyle(
                color: Colors.white,
                fontSize: innerSize * 0.52,
                fontWeight: FontWeight.w900,
                height: 1.0,
                letterSpacing: -1,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
