using System.Text;
using System.Text.RegularExpressions;

namespace Ldf.Application.Common;

public static class ArabicNormalizer
{
    public static string Normalize(string? input)
    {
        if (string.IsNullOrWhiteSpace(input)) return string.Empty;

        var text = input.Trim().ToLowerInvariant();

        // Strip Arabic Tatweel and Diacritics (Harakat)
        text = Regex.Replace(text, "[\u064B-\u0652\u0640]", "");

        var sb = new StringBuilder(text.Length);
        foreach (var ch in text)
        {
            switch (ch)
            {
                case 'أ':
                case 'إ':
                case 'آ':
                    sb.Append('ا');
                    break;
                case 'ى':
                    sb.Append('ي');
                    break;
                case 'ة':
                    sb.Append('ه');
                    break;
                default:
                    sb.Append(ch);
                    break;
            }
        }

        // Collapse multiple spaces
        return Regex.Replace(sb.ToString(), @"\s+", " ");
    }
}
